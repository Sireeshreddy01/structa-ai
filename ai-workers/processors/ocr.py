"""OCR Processing Engine"""
import cv2
import numpy as np
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict
import structlog

logger = structlog.get_logger()


@dataclass
class TextBlock:
    """Represents a detected text block"""
    text: str
    confidence: float
    bbox: tuple  # (x, y, width, height)
    language: Optional[str] = None
    is_handwritten: bool = False


@dataclass
class OCRResult:
    """Result from OCR processing"""
    full_text: str
    blocks: List[TextBlock]
    average_confidence: float
    languages_detected: List[str]
    processing_time_ms: float
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "full_text": self.full_text,
            "blocks": [asdict(b) for b in self.blocks],
            "average_confidence": self.average_confidence,
            "languages_detected": self.languages_detected,
            "processing_time_ms": self.processing_time_ms,
        }


class TesseractOCR:
    """Tesseract-based OCR engine"""
    
    def __init__(self, languages: str = "eng"):
        import pytesseract
        self.pytesseract = pytesseract
        self.languages = languages
    
    def process(self, image: np.ndarray, confidence_threshold: float = 0.5) -> OCRResult:
        """Process image and extract text using Tesseract"""
        import time
        start_time = time.time()
        
        # Convert to grayscale if needed
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image
        
        # Apply adaptive thresholding for better OCR
        processed = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY, 11, 2
        )
        
        # Get detailed OCR data
        data = self.pytesseract.image_to_data(
            processed,
            lang=self.languages,
            output_type=self.pytesseract.Output.DICT
        )
        
        blocks: List[TextBlock] = []
        confidences: List[float] = []
        
        n_boxes = len(data['text'])
        for i in range(n_boxes):
            text = data['text'][i].strip()
            conf = float(data['conf'][i]) / 100.0
            
            if text and conf >= confidence_threshold:
                block = TextBlock(
                    text=text,
                    confidence=conf,
                    bbox=(
                        data['left'][i],
                        data['top'][i],
                        data['width'][i],
                        data['height'][i]
                    ),
                    language=self.languages.split('+')[0],
                )
                blocks.append(block)
                confidences.append(conf)
        
        # Build full text by organizing blocks spatially
        full_text = self._organize_text(blocks, image.shape[1])
        
        processing_time = (time.time() - start_time) * 1000
        
        return OCRResult(
            full_text=full_text,
            blocks=blocks,
            average_confidence=sum(confidences) / len(confidences) if confidences else 0,
            languages_detected=[self.languages.split('+')[0]],
            processing_time_ms=processing_time,
        )
    
    def _organize_text(self, blocks: List[TextBlock], image_width: int) -> str:
        """Organize text blocks into readable text"""
        if not blocks:
            return ""
        
        # Sort blocks by y position, then x position
        sorted_blocks = sorted(blocks, key=lambda b: (b.bbox[1], b.bbox[0]))
        
        lines: List[List[TextBlock]] = []
        current_line: List[TextBlock] = []
        current_y = sorted_blocks[0].bbox[1]
        line_height_threshold = 20  # Pixels
        
        for block in sorted_blocks:
            if abs(block.bbox[1] - current_y) > line_height_threshold:
                if current_line:
                    lines.append(current_line)
                current_line = [block]
                current_y = block.bbox[1]
            else:
                current_line.append(block)
        
        if current_line:
            lines.append(current_line)
        
        # Sort each line by x position and join
        text_lines = []
        for line in lines:
            sorted_line = sorted(line, key=lambda b: b.bbox[0])
            text_lines.append(" ".join(b.text for b in sorted_line))
        
        return "\n".join(text_lines)


class EasyOCREngine:
    """EasyOCR-based OCR engine with better handwriting support"""
    
    def __init__(self, languages: List[str] = None):
        import easyocr
        self.languages = languages or ['en']
        self.reader = easyocr.Reader(self.languages, gpu=True)
    
    def process(self, image: np.ndarray, confidence_threshold: float = 0.5) -> OCRResult:
        """Process image and extract text using EasyOCR"""
        import time
        start_time = time.time()
        
        # Run OCR
        results = self.reader.readtext(image)
        
        blocks: List[TextBlock] = []
        confidences: List[float] = []
        
        for bbox, text, conf in results:
            if conf >= confidence_threshold:
                # Convert polygon bbox to rectangle
                x_coords = [p[0] for p in bbox]
                y_coords = [p[1] for p in bbox]
                rect_bbox = (
                    int(min(x_coords)),
                    int(min(y_coords)),
                    int(max(x_coords) - min(x_coords)),
                    int(max(y_coords) - min(y_coords)),
                )
                
                block = TextBlock(
                    text=text,
                    confidence=conf,
                    bbox=rect_bbox,
                    language=self.languages[0],
                )
                blocks.append(block)
                confidences.append(conf)
        
        # Build full text
        full_text = self._organize_text(blocks)
        
        processing_time = (time.time() - start_time) * 1000
        
        return OCRResult(
            full_text=full_text,
            blocks=blocks,
            average_confidence=sum(confidences) / len(confidences) if confidences else 0,
            languages_detected=self.languages,
            processing_time_ms=processing_time,
        )
    
    def _organize_text(self, blocks: List[TextBlock]) -> str:
        """Organize text blocks into readable text"""
        if not blocks:
            return ""
        
        # Sort by y position, then x position
        sorted_blocks = sorted(blocks, key=lambda b: (b.bbox[1], b.bbox[0]))
        
        lines: List[List[TextBlock]] = []
        current_line: List[TextBlock] = []
        current_y = sorted_blocks[0].bbox[1]
        line_height_threshold = 20
        
        for block in sorted_blocks:
            if abs(block.bbox[1] - current_y) > line_height_threshold:
                if current_line:
                    lines.append(current_line)
                current_line = [block]
                current_y = block.bbox[1]
            else:
                current_line.append(block)
        
        if current_line:
            lines.append(current_line)
        
        text_lines = []
        for line in lines:
            sorted_line = sorted(line, key=lambda b: b.bbox[0])
            text_lines.append(" ".join(b.text for b in sorted_line))
        
        return "\n".join(text_lines)


def get_ocr_engine(engine: str = "tesseract", languages: str = "eng") -> TesseractOCR | EasyOCREngine:
    """Factory function to get OCR engine"""
    if engine == "easyocr":
        return EasyOCREngine(languages=languages.split('+'))
    return TesseractOCR(languages=languages)
