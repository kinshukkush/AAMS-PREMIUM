"""
AAMS Face Recognition Service — MediaPipe Implementation
Replaces dlib/face_recognition with mediapipe (no CMake, Python 3.12 compatible).

Recognition method: cosine similarity on 478 face mesh landmark coordinates.
"""

import mediapipe as mp
import cv2
import numpy as np
import pickle
import os
import logging
import threading
import base64
from pathlib import Path
from datetime import datetime
from PIL import Image
import io

logger = logging.getLogger(__name__)

ENCODINGS_PATH = os.getenv('ENCODINGS_PATH', './data/encodings')
FACES_PATH     = os.getenv('FACES_PATH', './data/faces')
SIMILARITY_THRESHOLD = float(os.getenv('FACE_SIMILARITY_THRESHOLD', '0.92'))

# MediaPipe solutions
_mp_face_detection = mp.solutions.face_detection
_mp_face_mesh      = mp.solutions.face_mesh

# In-memory encoding cache: { student_id: [landmark_vector, ...] }
_encoding_cache: dict = {}
_cache_loaded: bool   = False
_cache_lock           = threading.Lock()


# ===== HELPERS =====

def ensure_dirs():
    Path(ENCODINGS_PATH).mkdir(parents=True, exist_ok=True)
    Path(FACES_PATH).mkdir(parents=True, exist_ok=True)
    Path('./data/temp').mkdir(parents=True, exist_ok=True)


def decode_image(b64_string: str) -> np.ndarray:
    """Decode a base64 image string to a numpy RGB array."""
    img_data = base64.b64decode(b64_string.split(',')[-1])
    img = Image.open(io.BytesIO(img_data)).convert('RGB')
    return np.array(img)


def _image_bytes_to_rgb(image_data: bytes) -> np.ndarray | None:
    nparr = np.frombuffer(image_data, np.uint8)
    img   = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        return None
    return cv2.cvtColor(img, cv2.COLOR_BGR2RGB)


def _extract_landmarks(rgb_image: np.ndarray) -> np.ndarray | None:
    """
    Extract 478 face mesh landmarks and return as a normalised 1-D vector.
    Returns None if no face is detected.
    """
    with _mp_face_mesh.FaceMesh(
        static_image_mode=True,
        max_num_faces=1,
        refine_landmarks=True,
        min_detection_confidence=0.5
    ) as face_mesh:
        results = face_mesh.process(rgb_image)

    if not results.multi_face_landmarks:
        return None

    lm = results.multi_face_landmarks[0].landmark
    # Flatten (x, y, z) for all 478 landmarks → 1434-dim vector
    vec = np.array([[p.x, p.y, p.z] for p in lm], dtype=np.float32).flatten()
    # L2 normalise for cosine similarity
    norm = np.linalg.norm(vec)
    if norm == 0:
        return None
    return vec / norm


def _cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    return float(np.dot(a, b))  # both are already L2-normalised


def get_encodings_file(student_id: str) -> str:
    return os.path.join(ENCODINGS_PATH, f"{student_id}.pkl")


# ===== REGISTRATION =====

def register_face(student_id: str, image_data: bytes) -> dict:
    """
    Register a student's face from raw image bytes.
    Extracts MediaPipe face mesh landmarks and saves them.
    """
    ensure_dirs()
    rgb = _image_bytes_to_rgb(image_data)
    if rgb is None:
        return {"success": False, "error": "Could not decode image"}

    # Detect face bounding box first
    with _mp_face_detection.FaceDetection(min_detection_confidence=0.6) as detector:
        det_results = detector.process(rgb)

    if not det_results.detections:
        return {"success": False, "error": "No face detected. Ensure clear frontal face lighting."}
    if len(det_results.detections) > 1:
        return {"success": False, "error": "Multiple faces detected. Only one face per registration."}

    vec = _extract_landmarks(rgb)
    if vec is None:
        return {"success": False, "error": "Could not extract face features (mesh failed)."}

    # Load existing and append
    existing = load_student_encodings(student_id)
    existing.append(vec)

    enc_file = get_encodings_file(student_id)
    with open(enc_file, 'wb') as f:
        pickle.dump(existing, f)

    # Save face image
    img_bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    img_path = os.path.join(FACES_PATH, f"{student_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg")
    cv2.imwrite(img_path, img_bgr)

    # Update cache
    _encoding_cache[student_id] = existing
    logger.info(f"✅ Face registered for {student_id} ({len(existing)} encoding(s))")

    bbox = det_results.detections[0].location_data.relative_bounding_box
    return {
        "success": True,
        "student_id": student_id,
        "encodings_count": len(existing),
        "bbox": {
            "xmin": float(bbox.xmin), "ymin": float(bbox.ymin),
            "width": float(bbox.width), "height": float(bbox.height)
        }
    }


def register_face_from_path(student_id: str, image_path: str) -> dict:
    with open(image_path, 'rb') as f:
        return register_face(student_id, f.read())


def load_student_encodings(student_id: str) -> list:
    enc_file = get_encodings_file(student_id)
    if os.path.exists(enc_file):
        with open(enc_file, 'rb') as f:
            return pickle.load(f)
    return []


# ===== ENCODING CACHE =====

def load_all_encodings() -> dict:
    global _encoding_cache, _cache_loaded
    ensure_dirs()
    cache = {}
    for enc_file in Path(ENCODINGS_PATH).glob("*.pkl"):
        student_id = enc_file.stem
        with open(enc_file, 'rb') as f:
            encodings = pickle.load(f)
        if encodings:
            cache[student_id] = encodings
    _encoding_cache = cache
    _cache_loaded   = True
    logger.info(f"📦 Loaded {len(cache)} student face encodings")
    return cache


def get_cache() -> dict:
    global _cache_loaded
    if not _cache_loaded:
        with _cache_lock:
            if not _cache_loaded:
                load_all_encodings()
    return _encoding_cache


def invalidate_cache(student_id: str = None):
    global _encoding_cache, _cache_loaded
    if student_id:
        _encoding_cache.pop(student_id, None)
        new_enc = load_student_encodings(student_id)
        if new_enc:
            _encoding_cache[student_id] = new_enc
    else:
        _cache_loaded = False
        load_all_encodings()


# ===== RECOGNITION =====

def recognize_faces_in_frame(frame_data: bytes) -> list:
    """
    Recognize all faces in a single video frame using MediaPipe.

    Returns:
        List[dict]: Each dict has: recognized, student_id, confidence, face_bbox
    """
    rgb = _image_bytes_to_rgb(frame_data)
    if rgb is None:
        return []

    # Detect faces
    with _mp_face_detection.FaceDetection(min_detection_confidence=0.55) as detector:
        det = detector.process(rgb)

    if not det.detections:
        return []

    known_cache = get_cache()
    if not known_cache:
        logger.warning("No face encodings in cache. Register students first.")
        return []

    results = []
    h, w = rgb.shape[:2]

    for detection in det.detections:
        bbox = detection.location_data.relative_bounding_box
        bbox_dict = {
            "top":    int(bbox.ymin * h),
            "left":   int(bbox.xmin * w),
            "bottom": int((bbox.ymin + bbox.height) * h),
            "right":  int((bbox.xmin + bbox.width) * w),
        }

        # Extract landmark vector for this face
        vec = _extract_landmarks(rgb)
        if vec is None:
            results.append({"recognized": False, "student_id": None, "confidence": 0.0, "face_bbox": bbox_dict})
            continue

        # Compare against all known encodings
        best_id, best_sim = None, -1.0
        for student_id, encs in known_cache.items():
            for enc in encs:
                sim = _cosine_similarity(vec, enc)
                if sim > best_sim:
                    best_sim, best_id = sim, student_id

        confidence = round(best_sim * 100, 2)
        recognized = best_sim >= SIMILARITY_THRESHOLD

        results.append({
            "recognized":  recognized,
            "student_id":  best_id if recognized else None,
            "confidence":  confidence,
            "similarity":  float(best_sim),
            "face_bbox":   bbox_dict,
        })

    return results


def recognize_from_base64(b64_image: str) -> list:
    """Accept base64 image string (from web camera)."""
    try:
        img_arr = decode_image(b64_image)
        img_bgr = cv2.cvtColor(img_arr, cv2.COLOR_RGB2BGR)
        _, buf = cv2.imencode('.jpg', img_bgr)
        return recognize_faces_in_frame(buf.tobytes())
    except Exception as e:
        logger.error(f"Base64 recognition error: {e}")
        return []


# ===== LIVENESS DETECTION (no dlib) =====

def check_liveness(frame_data: bytes) -> dict:
    """
    Liveness detection using Laplacian variance (blur) + LBP entropy.
    No dlib required.
    """
    nparr = np.frombuffer(frame_data, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if frame is None:
        return {"is_live": False, "score": 0.0}

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())

    # LBP entropy
    img_f = gray.astype(np.float32)
    center = img_f[1:-1, 1:-1]
    neighbors = [img_f[:-2, :-2], img_f[:-2, 1:-1], img_f[:-2, 2:], img_f[1:-1, 2:],
                 img_f[2:, 2:], img_f[2:, 1:-1], img_f[2:, :-2], img_f[1:-1, :-2]]
    lbp = np.zeros_like(center, dtype=np.uint8)
    for k, nb in enumerate(neighbors):
        lbp |= ((nb >= center) << k).astype(np.uint8)
    hist, _ = np.histogram(lbp, bins=256, range=(0, 256), density=True)
    hist = hist[hist > 0]
    entropy = float(-np.sum(hist * np.log2(hist)))
    lbp_score = min(1.0, entropy / 8.0)

    score = min(1.0, (laplacian_var / 500.0) * 0.5 + lbp_score * 0.5)
    threshold = float(os.getenv('LIVENESS_THRESHOLD', '0.7'))

    return {
        "is_live": bool(score >= threshold),
        "score": round(score, 3),
        "laplacian_var": round(laplacian_var, 2),
        "lbp_score": round(lbp_score, 3),
    }


# ===== DETECT FACES (simple, for API route) =====

def detect_faces(image_array: np.ndarray) -> list:
    """Light detection call returning bbox + confidence."""
    with _mp_face_detection.FaceDetection(min_detection_confidence=0.6) as detector:
        results = detector.process(cv2.cvtColor(image_array, cv2.COLOR_RGB2BGR))
    if not results.detections:
        return []
    return [
        {
            "confidence": float(d.score[0]),
            "bbox": {
                "xmin":   d.location_data.relative_bounding_box.xmin,
                "ymin":   d.location_data.relative_bounding_box.ymin,
                "width":  d.location_data.relative_bounding_box.width,
                "height": d.location_data.relative_bounding_box.height,
            }
        }
        for d in results.detections
    ]


# ===== UTILITIES =====

def delete_student_encodings(student_id: str) -> bool:
    enc_file = get_encodings_file(student_id)
    if os.path.exists(enc_file):
        os.remove(enc_file)
    for img in Path(FACES_PATH).glob(f"{student_id}_*.jpg"):
        img.unlink()
    _encoding_cache.pop(student_id, None)
    return True


def get_registration_status() -> dict:
    cache = get_cache()
    return {
        "total_registered":  len(cache),
        "student_ids":       list(cache.keys()),
        "total_encodings":   sum(len(v) for v in cache.values()),
        "backend":           "mediapipe",
    }
