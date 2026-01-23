"""Table Detection and Extraction"""
import cv2
import numpy as np
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
import structlog

logger = structlog.get_logger()


@dataclass
class TableCell:
    """Represents a single table cell"""
    row: int
    col: int
    row_span: int
    col_span: int
    text: str
    bbox: tuple  # (x, y, width, height)
    confidence: float
    is_header: bool = False


@dataclass
class Table:
    """Represents a detected table"""
    bbox: tuple  # (x, y, width, height)
    cells: List[TableCell]
    num_rows: int
    num_cols: int
    confidence: float
    has_header: bool
    
    def to_matrix(self) -> List[List[str]]:
        """Convert table to 2D matrix"""
        matrix = [["" for _ in range(self.num_cols)] for _ in range(self.num_rows)]
        
        for cell in self.cells:
            for r in range(cell.row, min(cell.row + cell.row_span, self.num_rows)):
                for c in range(cell.col, min(cell.col + cell.col_span, self.num_cols)):
                    if r == cell.row and c == cell.col:
                        matrix[r][c] = cell.text
                    else:
                        matrix[r][c] = ""  # Merged cell
        
        return matrix
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "bbox": self.bbox,
            "num_rows": self.num_rows,
            "num_cols": self.num_cols,
            "confidence": self.confidence,
            "has_header": self.has_header,
            "cells": [
                {
                    "row": c.row,
                    "col": c.col,
                    "row_span": c.row_span,
                    "col_span": c.col_span,
                    "text": c.text,
                    "bbox": c.bbox,
                    "is_header": c.is_header,
                }
                for c in self.cells
            ],
            "matrix": self.to_matrix(),
        }


@dataclass
class TableExtractionResult:
    """Result from table extraction"""
    tables: List[Table]
    processing_time_ms: float
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "tables": [t.to_dict() for t in self.tables],
            "processing_time_ms": self.processing_time_ms,
        }


class TableExtractor:
    """Extracts tables from document images"""
    
    def __init__(self, engine: str = "img2table"):
        self.engine = engine
        self._img2table = None
        self._camelot = None
        
        if engine == "img2table":
            try:
                from img2table.document import Image as Img2TableImage
                from img2table.ocr import TesseractOCR
                self._img2table = (Img2TableImage, TesseractOCR)
                logger.info("Using img2table for table extraction")
            except ImportError:
                logger.warning("img2table not available, falling back to heuristic")
        elif engine == "camelot":
            try:
                import camelot
                self._camelot = camelot
                logger.info("Using camelot for table extraction")
            except ImportError:
                logger.warning("camelot not available, falling back to heuristic")
    
    def extract(
        self,
        image: np.ndarray,
        regions: Optional[List[tuple]] = None,  # List of (x, y, w, h) bboxes
    ) -> TableExtractionResult:
        """Extract tables from image"""
        import time
        start_time = time.time()
        
        tables = []
        
        if regions:
            # Extract from specific regions
            for bbox in regions:
                x, y, w, h = bbox
                region_image = image[y:y+h, x:x+w]
                extracted = self._extract_single(region_image, offset=(x, y))
                tables.extend(extracted)
        else:
            # Detect and extract all tables
            tables = self._extract_single(image)
        
        processing_time = (time.time() - start_time) * 1000
        
        return TableExtractionResult(
            tables=tables,
            processing_time_ms=processing_time,
        )
    
    def _extract_single(
        self,
        image: np.ndarray,
        offset: tuple = (0, 0)
    ) -> List[Table]:
        """Extract tables from a single image region"""
        if self._img2table:
            return self._extract_with_img2table(image, offset)
        elif self._camelot:
            return self._extract_with_camelot(image, offset)
        else:
            return self._extract_heuristic(image, offset)
    
    def _extract_with_img2table(
        self,
        image: np.ndarray,
        offset: tuple
    ) -> List[Table]:
        """Use img2table for extraction"""
        Img2TableImage, TesseractOCR = self._img2table
        
        # Convert to PIL Image
        from PIL import Image as PILImage
        pil_image = PILImage.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
        
        # Create img2table document
        doc = Img2TableImage(src=pil_image)
        ocr = TesseractOCR(lang="eng")
        
        # Extract tables
        extracted_tables = doc.extract_tables(ocr=ocr)
        
        tables = []
        for i, ext_table in enumerate(extracted_tables):
            # Convert to our format
            cells = []
            df = ext_table.df
            
            for row_idx in range(len(df)):
                for col_idx in range(len(df.columns)):
                    cell_value = str(df.iloc[row_idx, col_idx])
                    
                    cells.append(TableCell(
                        row=row_idx,
                        col=col_idx,
                        row_span=1,
                        col_span=1,
                        text=cell_value,
                        bbox=(0, 0, 0, 0),  # img2table doesn't provide cell bboxes
                        confidence=0.8,
                        is_header=row_idx == 0,
                    ))
            
            bbox = ext_table.bbox if hasattr(ext_table, 'bbox') else (0, 0, image.shape[1], image.shape[0])
            
            tables.append(Table(
                bbox=(bbox[0] + offset[0], bbox[1] + offset[1], bbox[2] - bbox[0], bbox[3] - bbox[1]),
                cells=cells,
                num_rows=len(df),
                num_cols=len(df.columns),
                confidence=0.8,
                has_header=True,
            ))
        
        return tables
    
    def _extract_heuristic(
        self,
        image: np.ndarray,
        offset: tuple
    ) -> List[Table]:
        """Heuristic-based table extraction using line detection"""
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
        
        # Detect lines
        horizontal_lines, vertical_lines = self._detect_lines(gray)
        
        if not horizontal_lines or not vertical_lines:
            return []
        
        # Find grid intersections
        cells = self._find_cells(horizontal_lines, vertical_lines, image.shape)
        
        if not cells:
            return []
        
        # Extract text from each cell using simple OCR
        try:
            import pytesseract
            
            for cell in cells:
                x, y, w, h = cell.bbox
                cell_img = gray[y:y+h, x:x+w]
                
                if cell_img.size > 0:
                    cell.text = pytesseract.image_to_string(cell_img, config="--psm 6").strip()
        except ImportError:
            logger.warning("pytesseract not available for cell text extraction")
        
        # Create table
        if cells:
            num_rows = max(c.row for c in cells) + 1
            num_cols = max(c.col for c in cells) + 1
            
            x_coords = [c.bbox[0] for c in cells]
            y_coords = [c.bbox[1] for c in cells]
            widths = [c.bbox[0] + c.bbox[2] for c in cells]
            heights = [c.bbox[1] + c.bbox[3] for c in cells]
            
            return [Table(
                bbox=(
                    min(x_coords) + offset[0],
                    min(y_coords) + offset[1],
                    max(widths) - min(x_coords),
                    max(heights) - min(y_coords),
                ),
                cells=cells,
                num_rows=num_rows,
                num_cols=num_cols,
                confidence=0.6,
                has_header=True,
            )]
        
        return []
    
    def _detect_lines(
        self,
        gray: np.ndarray
    ) -> Tuple[List[tuple], List[tuple]]:
        """Detect horizontal and vertical lines"""
        # Apply thresholding
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
        
        # Detect horizontal lines
        horizontal_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (40, 1))
        horizontal = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, horizontal_kernel)
        
        # Detect vertical lines
        vertical_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 40))
        vertical = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, vertical_kernel)
        
        # Find contours for lines
        h_contours, _ = cv2.findContours(horizontal, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        v_contours, _ = cv2.findContours(vertical, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        horizontal_lines = [cv2.boundingRect(c) for c in h_contours]
        vertical_lines = [cv2.boundingRect(c) for c in v_contours]
        
        return horizontal_lines, vertical_lines
    
    def _find_cells(
        self,
        horizontal_lines: List[tuple],
        vertical_lines: List[tuple],
        image_shape: tuple
    ) -> List[TableCell]:
        """Find table cells from lines"""
        # Sort lines by position
        h_positions = sorted(set(line[1] for line in horizontal_lines))
        v_positions = sorted(set(line[0] for line in vertical_lines))
        
        if len(h_positions) < 2 or len(v_positions) < 2:
            return []
        
        cells = []
        
        for row_idx, (y1, y2) in enumerate(zip(h_positions[:-1], h_positions[1:])):
            for col_idx, (x1, x2) in enumerate(zip(v_positions[:-1], v_positions[1:])):
                cell = TableCell(
                    row=row_idx,
                    col=col_idx,
                    row_span=1,
                    col_span=1,
                    text="",
                    bbox=(x1, y1, x2 - x1, y2 - y1),
                    confidence=0.6,
                    is_header=row_idx == 0,
                )
                cells.append(cell)
        
        return cells


# Singleton instance
table_extractor = TableExtractor()
