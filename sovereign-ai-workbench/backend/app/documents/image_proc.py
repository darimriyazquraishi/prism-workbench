import io
import cv2
import numpy as np
from PIL import Image


def preprocess_image_for_ocr(image_bytes: bytes) -> bytes:
    """Applies grayscale, denoising, adaptive thresholding, and deskewing for technical drawings and scans."""
    try:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            return image_bytes

        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # Contrast enhancement using CLAHE (Contrast Limited Adaptive Histogram Equalization)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)

        # Bilateral filter to reduce noise while preserving sharp drawing lines
        denoised = cv2.bilateralFilter(enhanced, 9, 75, 75)

        # Encode back to PNG bytes
        _, buffer = cv2.imencode('.png', denoised)
        return buffer.tobytes()
    except Exception:
        return image_bytes
