"""FastAPI Worker Service"""
import io
import cv2
import numpy as np
from PIL import Image
from fastapi import FastAPI, HTTPException, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import structlog
import time

from config import settings
from processors import (
    preprocessor,
    get_ocr_engine,
    layout_detector,
    table_extractor,
)

# Configure logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ],
    wrapper_class=structlog.stdlib.BoundLogger,
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
)

logger = structlog.get_logger()

app = FastAPI(
    title="Structa AI Workers",
    description="AI Processing Pipeline for Document Analysis",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response models
class PreprocessRequest(BaseModel):
    deskew: bool = True
    denoise: bool = True
    enhance: bool = True
    crop: bool = True


class ProcessingResult(BaseModel):
    success: bool
    data: Dict[str, Any]
    processing_time_ms: float
    error: Optional[str] = None


# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "version": "1.0.0",
    }


# Preprocessing endpoint
@app.post("/preprocess", response_model=ProcessingResult)
async def preprocess_image(
    file: UploadFile = File(...),
    deskew: bool = Query(True),
    denoise: bool = Query(True),
    enhance: bool = Query(True),
    crop: bool = Query(True),
):
    """Preprocess an image for optimal AI processing"""
    start_time = time.time()
    
    try:
        # Read image
        contents = await file.read()
        image = _bytes_to_cv2(contents)
        
        # Process
        processed = preprocessor.process(
            image,
            deskew=deskew,
            denoise=denoise,
            enhance=enhance,
            crop=crop,
        )
        
        # Convert back to bytes
        processed_bytes = _cv2_to_bytes(processed)
        
        processing_time = (time.time() - start_time) * 1000
        
        return ProcessingResult(
            success=True,
            data={
                "original_size": image.shape[:2],
                "processed_size": processed.shape[:2],
                "image_base64": processed_bytes.decode("latin-1"),
            },
            processing_time_ms=processing_time,
        )
    except Exception as e:
        logger.error("Preprocessing failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


# OCR endpoint
@app.post("/ocr", response_model=ProcessingResult)
async def run_ocr(
    file: UploadFile = File(...),
    engine: str = Query("tesseract"),
    languages: str = Query("eng"),
    confidence_threshold: float = Query(0.5),
):
    """Extract text from image using OCR"""
    start_time = time.time()
    
    try:
        contents = await file.read()
        image = _bytes_to_cv2(contents)
        
        ocr_engine = get_ocr_engine(engine, languages)
        result = ocr_engine.process(image, confidence_threshold)
        
        processing_time = (time.time() - start_time) * 1000
        
        return ProcessingResult(
            success=True,
            data=result.to_dict(),
            processing_time_ms=processing_time,
        )
    except Exception as e:
        logger.error("OCR failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


# Layout detection endpoint
@app.post("/layout", response_model=ProcessingResult)
async def detect_layout(file: UploadFile = File(...)):
    """Detect document layout regions"""
    start_time = time.time()
    
    try:
        contents = await file.read()
        image = _bytes_to_cv2(contents)
        
        result = layout_detector.detect(image)
        
        processing_time = (time.time() - start_time) * 1000
        
        return ProcessingResult(
            success=True,
            data=result.to_dict(),
            processing_time_ms=processing_time,
        )
    except Exception as e:
        logger.error("Layout detection failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


# Table extraction endpoint
@app.post("/tables", response_model=ProcessingResult)
async def extract_tables(file: UploadFile = File(...)):
    """Extract tables from image"""
    start_time = time.time()
    
    try:
        contents = await file.read()
        image = _bytes_to_cv2(contents)
        
        result = table_extractor.extract(image)
        
        processing_time = (time.time() - start_time) * 1000
        
        return ProcessingResult(
            success=True,
            data=result.to_dict(),
            processing_time_ms=processing_time,
        )
    except Exception as e:
        logger.error("Table extraction failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


# Full pipeline endpoint
@app.post("/process", response_model=ProcessingResult)
async def full_process(
    file: UploadFile = File(...),
    preprocess: bool = Query(True),
    extract_tables: bool = Query(True),
):
    """Run full document processing pipeline"""
    start_time = time.time()
    
    try:
        contents = await file.read()
        image = _bytes_to_cv2(contents)
        
        results = {}
        
        # Step 1: Preprocess
        if preprocess:
            image = preprocessor.process(image)
            results["preprocessed"] = True
        
        # Step 2: Layout detection
        layout_result = layout_detector.detect(image)
        results["layout"] = layout_result.to_dict()
        
        # Step 3: OCR
        ocr_engine = get_ocr_engine("tesseract", "eng")
        ocr_result = ocr_engine.process(image)
        results["ocr"] = ocr_result.to_dict()
        
        # Step 4: Table extraction (if tables detected)
        if extract_tables and layout_result.has_tables:
            table_regions = [
                r.bbox for r in layout_result.regions
                if r.type.value == "table"
            ]
            table_result = table_extractor.extract(image, table_regions)
            results["tables"] = table_result.to_dict()
        
        processing_time = (time.time() - start_time) * 1000
        
        return ProcessingResult(
            success=True,
            data=results,
            processing_time_ms=processing_time,
        )
    except Exception as e:
        logger.error("Full processing failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


# Helper functions
def _bytes_to_cv2(data: bytes) -> np.ndarray:
    """Convert bytes to OpenCV image"""
    nparr = np.frombuffer(data, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("Could not decode image")
    return image


def _cv2_to_bytes(image: np.ndarray) -> bytes:
    """Convert OpenCV image to bytes"""
    _, buffer = cv2.imencode('.jpg', image)
    return buffer.tobytes()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        workers=settings.workers,
        reload=settings.debug,
    )
