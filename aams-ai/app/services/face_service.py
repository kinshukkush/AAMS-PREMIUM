"""
AAMS Face Recognition Service
Core module for face detection, encoding, and recognition.
Uses the face_recognition library (built on dlib).
"""

import face_recognition
import cv2
import numpy as np
import pickle
import os
import logging
import threading
from pathlib import Path
from datetime import datetime

logger = logging.getLogger(__name__)

ENCODINGS_PATH = os.getenv('ENCODINGS_PATH', './data/encodings')
FACES_PATH = os.getenv('FACES_PATH', './data/faces')
TOLERANCE = float(os.getenv('FACE_RECOGNITION_TOLERANCE', '0.5'))
MODEL = os.getenv('FACE_RECOGNITION_MODEL', 'hog')  # 'hog' or 'cnn'

# In-memory cache of face encodings: { student_id: [encoding, ...] }
_encoding_cache: dict = {}
_cache_loaded: bool = False
_cache_lock: threading.Lock = threading.Lock()  # SECURITY FIX: Thread safety


def ensure_dirs():
    """Create required directories if they don't exist."""
    Path(ENCODINGS_PATH).mkdir(parents=True, exist_ok=True)
    Path(FACES_PATH).mkdir(parents=True, exist_ok=True)
    Path('./data/temp').mkdir(parents=True, exist_ok=True)


def get_encodings_file(student_id: str) -> str:
    return os.path.join(ENCODINGS_PATH, f"{student_id}.pkl")


# ===== REGISTRATION =====

def register_face(student_id: str, image_data: bytes) -> dict:
    """
    Register a student's face from raw image bytes.
    Extracts face encodings and saves them.
    Returns success/failure dict.
    """
    ensure_dirs()

    # Decode image
    nparr = np.frombuffer(image_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        return {"success": False, "error": "Could not decode image"}

    # Convert BGR -> RGB (face_recognition uses RGB)
    rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    # Detect face locations
    face_locations = face_recognition.face_locations(rgb_img, model=MODEL)

    if len(face_locations) == 0:
        return {"success": False, "error": "No face detected in the image. Please ensure clear frontal face."}

    if len(face_locations) > 1:
        return {"success": False, "error": "Multiple faces detected. Please ensure only one face is in frame."}

    # Get face encoding
    encodings = face_recognition.face_encodings(rgb_img, face_locations)
    if not encodings:
        return {"success": False, "error": "Could not extract face features."}

    encoding = encodings[0]

    # Load existing encodings for this student (support multiple photos)
    existing = load_student_encodings(student_id)
    existing.append(encoding)

    # Save to disk
    enc_file = get_encodings_file(student_id)
    with open(enc_file, 'wb') as f:
        pickle.dump(existing, f)

    # Save face image
    face_img_path = os.path.join(FACES_PATH, f"{student_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg")
    cv2.imwrite(face_img_path, img)

    # Update cache
    _encoding_cache[student_id] = existing

    logger.info(f"✅ Face registered for student {student_id} ({len(existing)} encoding(s) total)")

    top, right, bottom, left = face_locations[0]
    return {
        "success": True,
        "student_id": student_id,
        "encodings_count": int(len(existing)),
        "face_location": {
            "top": int(top),
            "right": int(right),
            "bottom": int(bottom),
            "left": int(left)
        }
    }

def register_face_from_path(student_id: str, image_path: str) -> dict:
    """Register face from a file path (used when file is already saved)."""
    with open(image_path, 'rb') as f:
        return register_face(student_id, f.read())


def load_student_encodings(student_id: str) -> list:
    """Load saved encodings for a student from disk."""
    enc_file = get_encodings_file(student_id)
    if os.path.exists(enc_file):
        with open(enc_file, 'rb') as f:
            return pickle.load(f)
    return []


# ===== ENCODING CACHE =====

def load_all_encodings() -> dict:
    """
    Load ALL student encodings into memory cache.
    Called once at startup, and when new students register.
    Returns dict: { student_id: [encoding, ...] }
    """
    global _encoding_cache, _cache_loaded
    ensure_dirs()

    cache = {}
    enc_files = Path(ENCODINGS_PATH).glob("*.pkl")

    for enc_file in enc_files:
        student_id = enc_file.stem
        with open(enc_file, 'rb') as f:
            encodings = pickle.load(f)
            if encodings:
                cache[student_id] = encodings

    _encoding_cache = cache
    _cache_loaded = True
    logger.info(f"📦 Loaded {len(cache)} student face encodings into cache")
    return cache


def get_cache() -> dict:
    """Get encoding cache, loading from disk if not yet loaded (thread-safe)."""
    global _cache_loaded
    if not _cache_loaded:
        with _cache_lock:
            if not _cache_loaded:  # Double-check locking pattern
                load_all_encodings()
    return _encoding_cache


def invalidate_cache(student_id: str = None):
    """Invalidate cache for one student or all."""
    global _encoding_cache, _cache_loaded
    if student_id:
        _encoding_cache.pop(student_id, None)
        # Reload this student's encodings
        new_enc = load_student_encodings(student_id)
        if new_enc:
            _encoding_cache[student_id] = new_enc
    else:
        _cache_loaded = False
        load_all_encodings()


# ===== RECOGNITION =====

def recognize_faces_in_frame(frame_data: bytes) -> list:
    """
    Recognize all faces in a single video frame.
    
    Args:
        frame_data: Raw image bytes (JPEG/PNG)
    
    Returns:
        List of recognized students:
        [{ student_id, confidence, face_location, recognized }]
    """
    # Decode frame
    nparr = np.frombuffer(frame_data, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if frame is None:
        return []

    # Resize for speed (half size)
    small_frame = cv2.resize(frame, (0, 0), fx=0.5, fy=0.5)
    rgb_small = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)

    # Detect face locations (fast hog model)
    face_locations = face_recognition.face_locations(rgb_small, model=MODEL)
    if not face_locations:
        return []

    # Get face encodings for detected faces
    face_encodings = face_recognition.face_encodings(rgb_small, face_locations)

    # Get known encodings cache
    known_cache = get_cache()
    if not known_cache:
        logger.warning("No face encodings in cache. Register students first.")
        return []

    known_ids = list(known_cache.keys())
    known_encodings = []
    for sid in known_ids:
        known_encodings.extend(known_cache[sid])

    # Track which students we matched (to handle multiple encodings per student)
    id_per_encoding = []
    for sid in known_ids:
        for _ in known_cache[sid]:
            id_per_encoding.append(sid)

    results = []

    for face_encoding, face_location in zip(face_encodings, face_locations):
        if not known_encodings:
            results.append({"recognized": False, "student_id": None, "confidence": 0.0, "face_location": _scale_location(face_location)})
            continue

        # Compare against all known encodings
        face_distances = face_recognition.face_distance(known_encodings, face_encoding)
        matches = face_recognition.compare_faces(known_encodings, face_encoding, tolerance=TOLERANCE)

        best_match_idx = int(np.argmin(face_distances))
        best_distance = float(face_distances[best_match_idx])
        confidence = round((1 - best_distance) * 100, 2)

        if matches[best_match_idx] and confidence >= float(os.getenv('MIN_DETECTION_CONFIDENCE', '0.85')) * 100:
            matched_student_id = id_per_encoding[best_match_idx]
            results.append({
                "recognized": True,
                "student_id": matched_student_id,
                "confidence": confidence,
                "distance": best_distance,
                "face_location": _scale_location(face_location)  # Scale back up
            })
        else:
            results.append({
                "recognized": False,
                "student_id": None,
                "confidence": confidence,
                "distance": best_distance if matches else None,
                "face_location": _scale_location(face_location)
            })

    return results


def _scale_location(location: tuple, scale: float = 2.0) -> dict:
    """Scale face location back to original frame size."""
    top, right, bottom, left = location
    return {
        "top": int(top * scale),
        "right": int(right * scale),
        "bottom": int(bottom * scale),
        "left": int(left * scale)
    }


# ===== LIVENESS DETECTION =====

def check_liveness(frame_data: bytes) -> dict:
    """
    Simple liveness detection using texture analysis (LBP).
    A more robust solution would use deep learning.
    This checks that the face is not a printed photo.
    
    Returns: { is_live: bool, score: float, method: str }
    """
    nparr = np.frombuffer(frame_data, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if frame is None:
        return {"is_live": False, "score": 0.0, "method": "lbp"}

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Compute Laplacian variance (blur detection — printed photos tend to be blurry)
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()

    # Basic LBP texture analysis
    # Printed photos have less texture variation
    lbp_score = _compute_lbp_score(gray)

    # Combined score (heuristic)
    score = min(1.0, (laplacian_var / 500.0) * 0.5 + lbp_score * 0.5)
    threshold = float(os.getenv('LIVENESS_THRESHOLD', '0.7'))

    return {
    "is_live": bool(score >= threshold),
    "score": float(round(score, 3)),
    "laplacian_var": float(round(laplacian_var, 2)),
    "lbp_score": float(round(lbp_score, 3)),
    "method": "lbp_laplacian"
}

def _compute_lbp_score(gray_img: np.ndarray) -> float:
    """
    Compute Local Binary Pattern based texture score (OPTIMIZED).
    PERFORMANCE FIX: Use vectorized numpy operations instead of nested loops.
    """
    rows, cols = gray_img.shape
    
    # Convert to float for calculations
    img_float = gray_img.astype(np.float32)
    
    # Extract all 8 neighbors at once using array slicing (vectorized)
    center = img_float[1:-1, 1:-1]
    
    # Get all 8 neighbors (3x3 neighborhood)
    neighbors = [
        img_float[:-2, :-2],    # top-left
        img_float[:-2, 1:-1],   # top
        img_float[:-2, 2:],     # top-right
        img_float[1:-1, 2:],    # right
        img_float[2:, 2:],      # bottom-right
        img_float[2:, 1:-1],    # bottom
        img_float[2:, :-2],     # bottom-left
        img_float[1:-1, :-2],   # left
    ]
    
    # Compute LBP using vectorized operations
    lbp = np.zeros_like(center, dtype=np.uint8)
    for k, neighbor in enumerate(neighbors):
        lbp |= ((neighbor >= center) << k).astype(np.uint8)
    
    # Compute histogram entropy as texture measure
    hist, _ = np.histogram(lbp, bins=256, range=(0, 256), density=True)
    hist = hist[hist > 0]
    entropy = float(-np.sum(hist * np.log2(hist)))
    
    # Normalize entropy (max entropy ≈ 8 for 256 bins)
    return min(1.0, entropy / 8.0)


# ===== UTILITIES =====

def delete_student_encodings(student_id: str) -> bool:
    """Remove all face data for a student."""
    enc_file = get_encodings_file(student_id)
    if os.path.exists(enc_file):
        os.remove(enc_file)

    # Remove face images
    for img_file in Path(FACES_PATH).glob(f"{student_id}_*.jpg"):
        img_file.unlink()

    # Remove from cache
    _encoding_cache.pop(student_id, None)
    return True


def get_registration_status() -> dict:
    """Get stats about registered faces."""
    cache = get_cache()
    return {
        "total_registered": len(cache),
        "student_ids": list(cache.keys()),
        "total_encodings": sum(len(v) for v in cache.values())
    }


def draw_recognition_results(frame_data: bytes, results: list) -> bytes:
    """
    Draw bounding boxes and labels on frame for visualization.
    Returns annotated frame as JPEG bytes.
    """
    nparr = np.frombuffer(frame_data, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    for r in results:
        loc = r.get('face_location', {})
        top = loc.get('top', 0)
        right = loc.get('right', 0)
        bottom = loc.get('bottom', 0)
        left = loc.get('left', 0)

        color = (0, 214, 160) if r['recognized'] else (0, 68, 239)  # Green or red (BGR)
        cv2.rectangle(frame, (left, top), (right, bottom), color, 2)

        label = f"{r['student_id']} ({r['confidence']:.1f}%)" if r['recognized'] else "Unknown"
        cv2.rectangle(frame, (left, bottom - 25), (right, bottom), color, cv2.FILLED)
        cv2.putText(frame, label, (left + 4, bottom - 7),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)

    _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
    return buffer.tobytes()
