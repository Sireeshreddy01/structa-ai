"""Layout Detection and Region Segmentation"""
import cv2
import numpy as np
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict
from enum import Enum
import structlog

logger = structlog.get_logger()


class RegionType(str, Enum):
    TEXT = "text"
    TITLE = "title"
    PARAGRAPH = "paragraph"
    LIST = "list"
    TABLE = "table"
    FIGURE = "figure"
    EQUATION = "equation"
    HEADER = "header"
    FOOTER = "footer"
    UNKNOWN = "unknown"


@dataclass
class LayoutRegion:
    """Represents a detected layout region"""
    type: RegionType
    bbox: tuple  # (x, y, width, height)
    confidence: float
    order: int  # Reading order
    content: Optional[str] = None
    children: Optional[List["LayoutRegion"]] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "type": self.type.value,
            "bbox": self.bbox,
            "confidence": self.confidence,
            "order": self.order,
            "content": self.content,
            "children": [c.to_dict() for c in self.children] if self.children else None,
        }


@dataclass
class LayoutResult:
    """Result from layout detection"""
    regions: List[LayoutRegion]
    page_size: tuple  # (width, height)
    has_tables: bool
    has_figures: bool
    reading_order: List[int]
    processing_time_ms: float
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "regions": [r.to_dict() for r in self.regions],
            "page_size": self.page_size,
            "has_tables": self.has_tables,
            "has_figures": self.has_figures,
            "reading_order": self.reading_order,
            "processing_time_ms": self.processing_time_ms,
        }


class LayoutDetector:
    """Detects document layout regions"""
    
    def __init__(self, model_path: Optional[str] = None, confidence_threshold: float = 0.5):
        self.confidence_threshold = confidence_threshold
        self.model = None
        
        # Try to load layoutparser model
        try:
            import layoutparser as lp
            self.model = lp.Detectron2LayoutModel(
                model_path or "lp://PubLayNet/faster_rcnn_R_50_FPN_3x/config",
                extra_config=["MODEL.ROI_HEADS.SCORE_THRESH_TEST", confidence_threshold],
                label_map={0: "Text", 1: "Title", 2: "List", 3: "Table", 4: "Figure"},
            )
            logger.info("Loaded LayoutParser model")
        except Exception as e:
            logger.warning(f"Could not load LayoutParser model: {e}")
            logger.info("Falling back to heuristic layout detection")
    
    def detect(self, image: np.ndarray) -> LayoutResult:
        """Detect layout regions in image"""
        import time
        start_time = time.time()
        
        if self.model:
            regions = self._detect_with_model(image)
        else:
            regions = self._detect_heuristic(image)
        
        # Determine reading order
        reading_order = self._determine_reading_order(regions)
        
        # Update region order
        for idx, region_idx in enumerate(reading_order):
            regions[region_idx].order = idx
        
        processing_time = (time.time() - start_time) * 1000
        
        return LayoutResult(
            regions=regions,
            page_size=(image.shape[1], image.shape[0]),
            has_tables=any(r.type == RegionType.TABLE for r in regions),
            has_figures=any(r.type == RegionType.FIGURE for r in regions),
            reading_order=reading_order,
            processing_time_ms=processing_time,
        )
    
    def _detect_with_model(self, image: np.ndarray) -> List[LayoutRegion]:
        """Use LayoutParser model for detection"""
        import layoutparser as lp
        
        layout = self.model.detect(image)
        
        regions = []
        type_map = {
            "Text": RegionType.PARAGRAPH,
            "Title": RegionType.TITLE,
            "List": RegionType.LIST,
            "Table": RegionType.TABLE,
            "Figure": RegionType.FIGURE,
        }
        
        for block in layout:
            region_type = type_map.get(block.type, RegionType.UNKNOWN)
            
            regions.append(LayoutRegion(
                type=region_type,
                bbox=(
                    int(block.block.x_1),
                    int(block.block.y_1),
                    int(block.block.width),
                    int(block.block.height),
                ),
                confidence=block.score,
                order=0,
            ))
        
        return regions
    
    def _detect_heuristic(self, image: np.ndarray) -> List[LayoutRegion]:
        """Heuristic-based layout detection"""
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
        
        # Apply thresholding
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
        
        # Morphological operations to find text blocks
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (30, 5))
        dilated = cv2.dilate(thresh, kernel, iterations=3)
        
        # Find contours
        contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        regions = []
        image_area = image.shape[0] * image.shape[1]
        
        for i, contour in enumerate(contours):
            x, y, w, h = cv2.boundingRect(contour)
            area = w * h
            
            # Filter small regions
            if area < image_area * 0.001:
                continue
            
            # Classify based on aspect ratio and size
            aspect_ratio = w / h if h > 0 else 0
            relative_width = w / image.shape[1]
            relative_height = h / image.shape[0]
            
            if aspect_ratio > 5 and relative_width > 0.5:
                # Wide region at top/bottom might be header/footer
                if y < image.shape[0] * 0.15:
                    region_type = RegionType.HEADER
                elif y > image.shape[0] * 0.85:
                    region_type = RegionType.FOOTER
                else:
                    region_type = RegionType.PARAGRAPH
            elif relative_height > 0.3 and relative_width > 0.5:
                # Large region might be a table
                region_type = RegionType.TABLE
            elif aspect_ratio < 1.5 and relative_width < 0.3:
                # Square-ish smaller region might be a figure
                region_type = RegionType.FIGURE
            else:
                region_type = RegionType.PARAGRAPH
            
            regions.append(LayoutRegion(
                type=region_type,
                bbox=(x, y, w, h),
                confidence=0.7,  # Heuristic confidence
                order=i,
            ))
        
        return regions
    
    def _determine_reading_order(self, regions: List[LayoutRegion]) -> List[int]:
        """Determine natural reading order (top-to-bottom, left-to-right)"""
        if not regions:
            return []
        
        # Sort by y position (rows), then x position (columns)
        indexed_regions = list(enumerate(regions))
        
        # Group into rows based on y-overlap
        rows: List[List[tuple]] = []
        current_row: List[tuple] = []
        
        sorted_by_y = sorted(indexed_regions, key=lambda x: x[1].bbox[1])
        
        for idx, region in sorted_by_y:
            if not current_row:
                current_row.append((idx, region))
            else:
                # Check if this region is on the same row
                last_region = current_row[-1][1]
                y_overlap = (
                    region.bbox[1] < last_region.bbox[1] + last_region.bbox[3] and
                    last_region.bbox[1] < region.bbox[1] + region.bbox[3]
                )
                
                if y_overlap:
                    current_row.append((idx, region))
                else:
                    rows.append(current_row)
                    current_row = [(idx, region)]
        
        if current_row:
            rows.append(current_row)
        
        # Sort each row by x position
        reading_order = []
        for row in rows:
            sorted_row = sorted(row, key=lambda x: x[1].bbox[0])
            reading_order.extend([idx for idx, _ in sorted_row])
        
        return reading_order


# Singleton instance
layout_detector = LayoutDetector()
