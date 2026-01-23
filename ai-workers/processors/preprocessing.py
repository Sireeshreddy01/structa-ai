"""Image preprocessing pipeline"""
import cv2
import numpy as np
from PIL import Image
from typing import Tuple, Optional
import structlog

logger = structlog.get_logger()


class ImagePreprocessor:
    """Handles image preprocessing for optimal AI processing"""
    
    def __init__(self, max_size: int = 4096, quality: int = 85):
        self.max_size = max_size
        self.quality = quality
    
    def process(
        self,
        image: np.ndarray,
        deskew: bool = True,
        denoise: bool = True,
        enhance: bool = True,
        crop: bool = True,
    ) -> np.ndarray:
        """Run full preprocessing pipeline"""
        logger.info("Starting preprocessing pipeline")
        
        # Resize if too large
        image = self._resize_if_needed(image)
        
        # Auto-crop document
        if crop:
            image = self._auto_crop(image)
        
        # Deskew
        if deskew:
            image = self._deskew(image)
        
        # Denoise
        if denoise:
            image = self._denoise(image)
        
        # Enhance contrast
        if enhance:
            image = self._enhance_contrast(image)
        
        logger.info("Preprocessing complete")
        return image
    
    def _resize_if_needed(self, image: np.ndarray) -> np.ndarray:
        """Resize image if it exceeds max size"""
        height, width = image.shape[:2]
        
        if max(height, width) > self.max_size:
            scale = self.max_size / max(height, width)
            new_width = int(width * scale)
            new_height = int(height * scale)
            image = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_LANCZOS4)
            logger.debug(f"Resized image to {new_width}x{new_height}")
        
        return image
    
    def _auto_crop(self, image: np.ndarray) -> np.ndarray:
        """Auto-detect and crop document boundaries"""
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
        
        # Apply Gaussian blur and edge detection
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        edges = cv2.Canny(blurred, 50, 150)
        
        # Find contours
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if not contours:
            return image
        
        # Find largest contour
        largest_contour = max(contours, key=cv2.contourArea)
        
        # Get bounding rectangle
        x, y, w, h = cv2.boundingRect(largest_contour)
        
        # Add small padding
        padding = 10
        x = max(0, x - padding)
        y = max(0, y - padding)
        w = min(image.shape[1] - x, w + 2 * padding)
        h = min(image.shape[0] - y, h + 2 * padding)
        
        # Check if crop is significant
        area_ratio = (w * h) / (image.shape[0] * image.shape[1])
        if area_ratio > 0.3:  # Only crop if document takes at least 30% of image
            cropped = image[y:y+h, x:x+w]
            logger.debug(f"Cropped image to {w}x{h}")
            return cropped
        
        return image
    
    def _deskew(self, image: np.ndarray) -> np.ndarray:
        """Correct image skew"""
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
        
        # Apply thresholding
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
        
        # Get coordinates of non-zero pixels
        coords = np.column_stack(np.where(thresh > 0))
        
        if len(coords) < 10:
            return image
        
        # Get rotation angle
        angle = cv2.minAreaRect(coords)[-1]
        
        # Correct angle
        if angle < -45:
            angle = 90 + angle
        elif angle > 45:
            angle = angle - 90
        
        # Only deskew if angle is significant but not too extreme
        if abs(angle) < 0.5 or abs(angle) > 10:
            return image
        
        # Rotate
        (h, w) = image.shape[:2]
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, angle, 1.0)
        rotated = cv2.warpAffine(
            image, M, (w, h),
            flags=cv2.INTER_CUBIC,
            borderMode=cv2.BORDER_REPLICATE
        )
        
        logger.debug(f"Deskewed image by {angle:.2f} degrees")
        return rotated
    
    def _denoise(self, image: np.ndarray) -> np.ndarray:
        """Remove noise from image"""
        if len(image.shape) == 3:
            denoised = cv2.fastNlMeansDenoisingColored(image, None, 10, 10, 7, 21)
        else:
            denoised = cv2.fastNlMeansDenoising(image, None, 10, 7, 21)
        
        logger.debug("Denoised image")
        return denoised
    
    def _enhance_contrast(self, image: np.ndarray) -> np.ndarray:
        """Enhance image contrast using CLAHE"""
        if len(image.shape) == 3:
            # Convert to LAB color space
            lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
            l, a, b = cv2.split(lab)
            
            # Apply CLAHE to L channel
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            l = clahe.apply(l)
            
            # Merge channels
            enhanced_lab = cv2.merge([l, a, b])
            enhanced = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)
        else:
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            enhanced = clahe.apply(image)
        
        logger.debug("Enhanced contrast")
        return enhanced
    
    def perspective_correction(
        self,
        image: np.ndarray,
        corners: Optional[np.ndarray] = None
    ) -> np.ndarray:
        """Apply perspective correction to flatten document"""
        if corners is None:
            corners = self._detect_document_corners(image)
        
        if corners is None:
            return image
        
        # Order corners: top-left, top-right, bottom-right, bottom-left
        corners = self._order_corners(corners)
        
        # Calculate output dimensions
        width = max(
            np.linalg.norm(corners[0] - corners[1]),
            np.linalg.norm(corners[2] - corners[3])
        )
        height = max(
            np.linalg.norm(corners[0] - corners[3]),
            np.linalg.norm(corners[1] - corners[2])
        )
        
        dst_corners = np.array([
            [0, 0],
            [width - 1, 0],
            [width - 1, height - 1],
            [0, height - 1]
        ], dtype=np.float32)
        
        # Get perspective transform
        M = cv2.getPerspectiveTransform(corners.astype(np.float32), dst_corners)
        warped = cv2.warpPerspective(image, M, (int(width), int(height)))
        
        logger.debug("Applied perspective correction")
        return warped
    
    def _detect_document_corners(self, image: np.ndarray) -> Optional[np.ndarray]:
        """Detect document corners using contour detection"""
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
        
        # Edge detection
        edges = cv2.Canny(gray, 50, 150)
        edges = cv2.dilate(edges, None)
        
        # Find contours
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if not contours:
            return None
        
        # Find largest contour
        largest = max(contours, key=cv2.contourArea)
        
        # Approximate polygon
        epsilon = 0.02 * cv2.arcLength(largest, True)
        approx = cv2.approxPolyDP(largest, epsilon, True)
        
        if len(approx) == 4:
            return approx.reshape(4, 2)
        
        return None
    
    def _order_corners(self, corners: np.ndarray) -> np.ndarray:
        """Order corners: top-left, top-right, bottom-right, bottom-left"""
        # Sum of coordinates: top-left has smallest, bottom-right has largest
        s = corners.sum(axis=1)
        diff = np.diff(corners, axis=1)
        
        ordered = np.zeros((4, 2), dtype=corners.dtype)
        ordered[0] = corners[np.argmin(s)]      # top-left
        ordered[2] = corners[np.argmax(s)]      # bottom-right
        ordered[1] = corners[np.argmin(diff)]   # top-right
        ordered[3] = corners[np.argmax(diff)]   # bottom-left
        
        return ordered


# Singleton instance
preprocessor = ImagePreprocessor()
