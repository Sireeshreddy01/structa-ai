"""Data Structuring and Intelligence Pipeline"""
from typing import List, Dict, Any, Optional, Union
from dataclasses import dataclass, asdict
from enum import Enum
import re
import json
import structlog

logger = structlog.get_logger()


class BlockType(str, Enum):
    """Types of content blocks"""
    TEXT = "text"
    TITLE = "title"
    HEADING = "heading"
    PARAGRAPH = "paragraph"
    LIST = "list"
    LIST_ITEM = "list_item"
    TABLE = "table"
    KEY_VALUE = "key_value"
    FIGURE = "figure"
    EQUATION = "equation"
    CODE = "code"
    METADATA = "metadata"


@dataclass
class ContentBlock:
    """A structured content block"""
    type: BlockType
    content: Union[str, List[Any], Dict[str, Any]]
    bbox: Optional[tuple] = None  # (x, y, width, height)
    confidence: float = 1.0
    page: int = 1
    order: int = 0
    metadata: Optional[Dict[str, Any]] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "type": self.type.value,
            "content": self.content,
            "bbox": self.bbox,
            "confidence": self.confidence,
            "page": self.page,
            "order": self.order,
            "metadata": self.metadata,
        }


@dataclass
class StructuredDocument:
    """A fully structured document"""
    title: Optional[str]
    blocks: List[ContentBlock]
    metadata: Dict[str, Any]
    tables: List[Dict[str, Any]]
    key_values: Dict[str, Any]
    raw_text: str
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "title": self.title,
            "blocks": [b.to_dict() for b in self.blocks],
            "metadata": self.metadata,
            "tables": self.tables,
            "key_values": self.key_values,
            "raw_text": self.raw_text,
        }
    
    def to_json(self, indent: int = 2) -> str:
        return json.dumps(self.to_dict(), indent=indent, ensure_ascii=False)


class DataStructurer:
    """Converts raw OCR and layout data into structured documents"""
    
    def __init__(self):
        self.key_value_patterns = [
            r'^([A-Za-z\s]+):\s*(.+)$',  # Label: Value
            r'^([A-Za-z\s]+)\s*-\s*(.+)$',  # Label - Value
            r'^([A-Za-z\s]+)\s{2,}(.+)$',  # Label    Value (multiple spaces)
        ]
        
        self.date_patterns = [
            r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}',
            r'\d{4}[/-]\d{1,2}[/-]\d{1,2}',
            r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b',
        ]
        
        self.currency_pattern = r'[\$£€¥]\s*[\d,]+\.?\d*'
        self.number_pattern = r'\b\d+(?:,\d{3})*(?:\.\d+)?\b'
    
    def structure(
        self,
        ocr_result: Dict[str, Any],
        layout_result: Dict[str, Any],
        table_result: Optional[Dict[str, Any]] = None,
    ) -> StructuredDocument:
        """Convert raw results into a structured document"""
        logger.info("Starting data structuring")
        
        blocks: List[ContentBlock] = []
        
        # Process layout regions with OCR text
        regions = layout_result.get("regions", [])
        ocr_blocks = ocr_result.get("blocks", [])
        
        for idx, region in enumerate(regions):
            region_bbox = tuple(region.get("bbox", (0, 0, 0, 0)))
            region_type = region.get("type", "text")
            
            # Find OCR blocks within this region
            region_text = self._get_text_in_region(ocr_blocks, region_bbox)
            
            # Create content block based on type
            block_type = self._map_region_type(region_type)
            
            if block_type == BlockType.TABLE and table_result:
                # Find matching table
                table_data = self._find_table_for_region(table_result, region_bbox)
                if table_data:
                    content = table_data.get("matrix", [])
                else:
                    content = region_text
            elif block_type == BlockType.LIST:
                content = self._parse_list(region_text)
            else:
                content = region_text
            
            blocks.append(ContentBlock(
                type=block_type,
                content=content,
                bbox=region_bbox,
                confidence=region.get("confidence", 0.5),
                page=1,
                order=idx,
            ))
        
        # If no layout regions, create blocks from OCR
        if not blocks and ocr_blocks:
            blocks = self._blocks_from_ocr(ocr_blocks)
        
        # Extract key-value pairs
        key_values = self._extract_key_values(ocr_result.get("full_text", ""))
        
        # Extract title
        title = self._extract_title(blocks)
        
        # Build metadata
        metadata = self._build_metadata(
            ocr_result,
            layout_result,
            table_result,
            key_values,
        )
        
        # Get tables
        tables = table_result.get("tables", []) if table_result else []
        
        logger.info("Data structuring complete", num_blocks=len(blocks))
        
        return StructuredDocument(
            title=title,
            blocks=blocks,
            metadata=metadata,
            tables=tables,
            key_values=key_values,
            raw_text=ocr_result.get("full_text", ""),
        )
    
    def _map_region_type(self, region_type: str) -> BlockType:
        """Map layout region type to block type"""
        mapping = {
            "text": BlockType.PARAGRAPH,
            "title": BlockType.TITLE,
            "paragraph": BlockType.PARAGRAPH,
            "list": BlockType.LIST,
            "table": BlockType.TABLE,
            "figure": BlockType.FIGURE,
            "header": BlockType.METADATA,
            "footer": BlockType.METADATA,
        }
        return mapping.get(region_type, BlockType.TEXT)
    
    def _get_text_in_region(
        self,
        ocr_blocks: List[Dict],
        region_bbox: tuple
    ) -> str:
        """Get OCR text that falls within a region"""
        rx, ry, rw, rh = region_bbox
        
        texts = []
        for block in ocr_blocks:
            bbox = block.get("bbox", (0, 0, 0, 0))
            bx, by, bw, bh = bbox
            
            # Check if block center is within region
            center_x = bx + bw / 2
            center_y = by + bh / 2
            
            if (rx <= center_x <= rx + rw and
                ry <= center_y <= ry + rh):
                texts.append(block.get("text", ""))
        
        return " ".join(texts)
    
    def _find_table_for_region(
        self,
        table_result: Dict,
        region_bbox: tuple
    ) -> Optional[Dict]:
        """Find table that matches a region"""
        tables = table_result.get("tables", [])
        rx, ry, rw, rh = region_bbox
        
        for table in tables:
            tx, ty, tw, th = table.get("bbox", (0, 0, 0, 0))
            
            # Check overlap
            overlap_x = max(0, min(rx + rw, tx + tw) - max(rx, tx))
            overlap_y = max(0, min(ry + rh, ty + th) - max(ry, ty))
            overlap_area = overlap_x * overlap_y
            
            table_area = tw * th
            
            if table_area > 0 and overlap_area / table_area > 0.5:
                return table
        
        return None
    
    def _parse_list(self, text: str) -> List[str]:
        """Parse text into list items"""
        lines = text.split('\n')
        items = []
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Remove common list markers
            cleaned = re.sub(r'^[\-\*\•\◦\▪\d+\.]\s*', '', line)
            if cleaned:
                items.append(cleaned)
        
        return items if items else [text]
    
    def _blocks_from_ocr(self, ocr_blocks: List[Dict]) -> List[ContentBlock]:
        """Create content blocks from OCR blocks when no layout available"""
        blocks = []
        
        # Group blocks into lines
        sorted_blocks = sorted(ocr_blocks, key=lambda b: (b.get("bbox", (0,0))[1], b.get("bbox", (0,0))[0]))
        
        current_line_y = -1
        current_line_text = []
        line_blocks = []
        
        for idx, block in enumerate(sorted_blocks):
            bbox = block.get("bbox", (0, 0, 0, 0))
            y = bbox[1]
            
            if current_line_y < 0:
                current_line_y = y
            
            # New line if y difference is significant
            if abs(y - current_line_y) > 20:
                if current_line_text:
                    text = " ".join(current_line_text)
                    block_type = self._classify_text(text)
                    
                    line_blocks.append(ContentBlock(
                        type=block_type,
                        content=text,
                        confidence=sum(b.get("confidence", 0.5) for b in current_line_text) / len(current_line_text) if current_line_text else 0.5,
                        order=len(line_blocks),
                    ))
                
                current_line_text = [block.get("text", "")]
                current_line_y = y
            else:
                current_line_text.append(block.get("text", ""))
        
        # Don't forget last line
        if current_line_text:
            text = " ".join(current_line_text)
            block_type = self._classify_text(text)
            
            line_blocks.append(ContentBlock(
                type=block_type,
                content=text,
                order=len(line_blocks),
            ))
        
        return line_blocks
    
    def _classify_text(self, text: str) -> BlockType:
        """Classify text into a block type"""
        text = text.strip()
        
        # Check for key-value pair
        for pattern in self.key_value_patterns:
            if re.match(pattern, text):
                return BlockType.KEY_VALUE
        
        # Check for list item
        if re.match(r'^[\-\*\•\◦\▪\d+\.]\s+', text):
            return BlockType.LIST_ITEM
        
        # Check for heading (all caps or short)
        if text.isupper() and len(text) < 50:
            return BlockType.HEADING
        
        # Default to paragraph
        return BlockType.PARAGRAPH
    
    def _extract_key_values(self, text: str) -> Dict[str, Any]:
        """Extract key-value pairs from text"""
        key_values = {}
        
        lines = text.split('\n')
        
        for line in lines:
            line = line.strip()
            
            for pattern in self.key_value_patterns:
                match = re.match(pattern, line)
                if match:
                    key = match.group(1).strip().lower().replace(' ', '_')
                    value = match.group(2).strip()
                    
                    # Try to parse value
                    parsed_value = self._parse_value(value)
                    key_values[key] = parsed_value
                    break
        
        return key_values
    
    def _parse_value(self, value: str) -> Union[str, int, float, bool]:
        """Parse a value into appropriate type"""
        # Boolean
        if value.lower() in ('yes', 'true', 'y'):
            return True
        if value.lower() in ('no', 'false', 'n'):
            return False
        
        # Number
        clean_value = value.replace(',', '').replace('$', '').replace('€', '').replace('£', '')
        try:
            if '.' in clean_value:
                return float(clean_value)
            return int(clean_value)
        except ValueError:
            pass
        
        return value
    
    def _extract_title(self, blocks: List[ContentBlock]) -> Optional[str]:
        """Extract document title from blocks"""
        for block in blocks:
            if block.type == BlockType.TITLE:
                return block.content if isinstance(block.content, str) else str(block.content)
        
        # Look for first heading
        for block in blocks:
            if block.type == BlockType.HEADING:
                return block.content if isinstance(block.content, str) else str(block.content)
        
        return None
    
    def _build_metadata(
        self,
        ocr_result: Dict,
        layout_result: Dict,
        table_result: Optional[Dict],
        key_values: Dict,
    ) -> Dict[str, Any]:
        """Build document metadata"""
        metadata = {
            "ocr_confidence": ocr_result.get("average_confidence", 0),
            "languages": ocr_result.get("languages_detected", []),
            "page_size": layout_result.get("page_size"),
            "has_tables": layout_result.get("has_tables", False),
            "has_figures": layout_result.get("has_figures", False),
            "num_regions": len(layout_result.get("regions", [])),
            "num_tables": len(table_result.get("tables", [])) if table_result else 0,
            "num_key_values": len(key_values),
        }
        
        # Extract dates from text
        text = ocr_result.get("full_text", "")
        dates = []
        for pattern in self.date_patterns:
            dates.extend(re.findall(pattern, text))
        
        if dates:
            metadata["dates_found"] = dates[:5]  # Limit to first 5
        
        # Extract currency values
        currencies = re.findall(self.currency_pattern, text)
        if currencies:
            metadata["currency_values"] = currencies[:5]
        
        return metadata


# Singleton instance
data_structurer = DataStructurer()
