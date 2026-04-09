"""
AAMS AI Service — Flask API Routes
"""

from flask import Blueprint, request, jsonify, current_app
import os
import logging
import base64
import requests
import cv2
import numpy as np
from app.services.face_service import (
    register_face,
    recognize_faces_in_frame,
    check_liveness,
    delete_student_encodings,
    get_registration_status,
    load_all_encodings,
    draw_recognition_results
)

logger = logging.getLogger(__name__)
api_bp = Blueprint('api', __name__, url_prefix='/api')

BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:5000')


def validate_image_bytes(image_data: bytes) -> bool:
    """SECURITY FIX: Validate that bytes are actually a valid image."""
    if not image_data or len(image_data) < 100:
        return False
    
    try:
        nparr = np.frombuffer(image_data, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return frame is not None and frame.size > 0
    except Exception:
        return False


def get_frame_data(request_obj):
    """Extract raw image bytes from request."""
    # Priority 1: File upload
    if 'image' in request_obj.files:
        data = request_obj.files['image'].read()
        if validate_image_bytes(data):
            return data
        else:
            return None

    # Priority 2: Base64 in JSON body
    data = request_obj.get_json(silent=True) or {}
    if 'frame' in data:
        try:
            b64 = data['frame']
            if b64.startswith('data:image'):
                b64 = b64.split(',')[1]
            decoded = base64.b64decode(b64)
            if validate_image_bytes(decoded):
                return decoded
        except Exception:
            return None

    # Priority 3: Raw bytes
    if request_obj.content_type and 'image' in request_obj.content_type:
        data = request_obj.data
        if validate_image_bytes(data):
            return data

    return None


def post_to_backend_with_retry(endpoint: str, data: dict, max_retries: int = 3, timeout: int = 3) -> bool:
    """
    PERFORMANCE FIX: Post to backend with exponential backoff retry logic.
    Prevents loss of face recognition results due to short timeout.
    """
    import time
    
    url = f"{BACKEND_URL}{endpoint}"
    
    for attempt in range(max_retries):
        try:
            response = requests.post(url, json=data, timeout=timeout)
            if response.status_code in [200, 201]:
                return True
            logger.warning(f"Backend returned {response.status_code}")
        except requests.exceptions.Timeout:
            wait_time = 2 ** attempt  # Exponential backoff: 1s, 2s, 4s
            if attempt < max_retries - 1:
                logger.warning(f"Backend timeout, retrying in {wait_time}s (attempt {attempt + 1}/{max_retries})")
                time.sleep(wait_time)
            else:
                logger.error(f"Backend timeout after {max_retries} attempts")
        except Exception as e:
            logger.error(f"Backend communication error: {e}")
            return False
    
    return False


# ===== HEALTH =====

@api_bp.route('/health', methods=['GET'])
def health():
    status = get_registration_status()
    return jsonify({
        "status": "OK",
        "service": "AAMS Face Recognition Service",
        "version": "1.0.0",
        "model": os.getenv('FACE_RECOGNITION_MODEL', 'hog'),
        "tolerance": float(os.getenv('FACE_RECOGNITION_TOLERANCE', '0.5')),
        "registered_students": int(status['total_registered'])
    })


# ===== REGISTRATION =====

@api_bp.route('/register/<student_id>', methods=['POST'])
def register_student_face(student_id):
    """Register a student face. Accepts multipart/form-data with 'image' field."""

    frame_data = get_frame_data(request)
    if frame_data is None:
        return jsonify({"success": False, "error": "No image provided."}), 400

    # Liveness detection — only if enabled in .env
    liveness_enabled = os.getenv('ENABLE_LIVENESS_DETECTION', 'false').lower() == 'true'

    if liveness_enabled:
        try:
            liveness_result = check_liveness(frame_data)
            is_live = bool(liveness_result.get('is_live', True))
            score = float(liveness_result.get('score', 1.0))

            if not is_live:
                logger.warning(f"Liveness check failed for {student_id}: score={score}")
                return jsonify({
                    "success": False,
                    "error": f"Liveness check failed (score: {score:.2f}). Please ensure good lighting and look directly at the camera.",
                    "liveness_score": score
                }), 400
        except Exception as e:
            # If liveness check itself fails, log and continue without blocking
            logger.error(f"Liveness check error: {e}")

    # Register the face
    result = register_face(student_id, frame_data)

    if result['success']:
        # Notify backend that face is registered (non-blocking)
        try:
            requests.patch(
                f"{BACKEND_URL}/api/users/{student_id}",
                json={"faceRegistered": True},
                timeout=3
            )
        except Exception:
            pass  # Don't fail if backend unreachable

    status_code = 200 if result['success'] else 400
    return jsonify(result), status_code


@api_bp.route('/register/<student_id>', methods=['DELETE'])
def delete_face(student_id):
    """Remove all face data for a student."""
    try:
        deleted = delete_student_encodings(student_id)
        if deleted:
            try:
                requests.patch(
                    f"{BACKEND_URL}/api/users/{student_id}",
                    json={"faceRegistered": False},
                    timeout=3
                )
            except Exception:
                pass
        return jsonify({"success": True, "message": f"Face data deleted for {student_id}."})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ===== RECOGNITION =====

@api_bp.route('/recognize', methods=['POST'])
def recognize():
    """Recognize faces in a single frame."""
    frame_data = get_frame_data(request)
    if frame_data is None:
        return jsonify({"success": False, "error": "No frame provided."}), 400

    body = request.get_json(silent=True) or {}
    session_id = body.get('sessionId')

    try:
        results = recognize_faces_in_frame(frame_data)
        recognized = [r for r in results if r['recognized']]

        # Auto-mark attendance if session_id provided
        if session_id and recognized:
            for r in recognized:
                # PERFORMANCE FIX: Use retry logic instead of fire-and-forget
                post_to_backend_with_retry(
                    '/api/attendance/face-result',
                    {
                        "sessionId": session_id,
                        "studentId": r['student_id'],
                        "confidence": float(r['confidence']),
                        "status": "present"
                    }
                )

        return jsonify({
            "success": True,
            "faces_detected": int(len(results)),
            "recognized": int(len(recognized)),
            "results": results
        })
    except Exception as e:
        logger.error(f"Recognition error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@api_bp.route('/recognize/stream', methods=['POST'])
def recognize_stream():
    """Optimized endpoint for continuous video stream frames."""
    frame_data = get_frame_data(request)
    if frame_data is None:
        return jsonify({"faces": [], "recognized": 0}), 200

    body = request.get_json(silent=True) or {}
    session_id = body.get('sessionId')
    already_marked = set(body.get('alreadyMarked', []))

    try:
        results = recognize_faces_in_frame(frame_data)

        new_recognitions = []
        for r in results:
            if r['recognized'] and r['student_id'] not in already_marked:
                new_recognitions.append(r)

        if session_id and new_recognitions:
            for r in new_recognitions:
                try:
                    requests.post(
                        f"{BACKEND_URL}/api/attendance/face-result",
                        json={
                            "sessionId": session_id,
                            "studentId": r['student_id'],
                            "confidence": float(r['confidence']),
                            "status": "present"
                        },
                        timeout=2
                    )
                except Exception:
                    pass

        return jsonify({
            "faces_detected": int(len(results)),
            "new_recognized": int(len(new_recognitions)),
            "results": new_recognitions
        })
    except Exception as e:
        logger.error(f"Stream recognition error: {e}")
        return jsonify({"faces_detected": 0, "new_recognized": 0, "results": []}), 200


# ===== LIVENESS =====

@api_bp.route('/liveness', methods=['POST'])
def liveness_check():
    """Standalone liveness detection endpoint."""
    frame_data = get_frame_data(request)
    if frame_data is None:
        return jsonify({"success": False, "error": "No image provided."}), 400

    try:
        result = check_liveness(frame_data)
        return jsonify({"success": True, "liveness": result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ===== STATUS =====

@api_bp.route('/status', methods=['GET'])
def status():
    """Get service status and registered students count."""
    try:
        info = get_registration_status()
        return jsonify({"success": True, "data": info})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@api_bp.route('/reload-cache', methods=['POST'])
def reload_cache():
    """Force reload of face encoding cache."""
    try:
        cache = load_all_encodings()
        return jsonify({
            "success": True,
            "message": f"Cache reloaded. {len(cache)} students loaded."
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ===== BATCH =====

@api_bp.route('/batch-recognize', methods=['POST'])
def batch_recognize():
    """Recognize faces in multiple frames at once."""
    body = request.get_json()
    if not body or 'frames' not in body:
        return jsonify({"success": False, "error": "frames array required"}), 400

    session_id = body.get('sessionId')
    frames = body['frames'][:10]
    all_results = []
    marked_ids = set()

    for frame_b64 in frames:
        try:
            if frame_b64.startswith('data:image'):
                frame_b64 = frame_b64.split(',')[1]
            frame_data = base64.b64decode(frame_b64)
            results = recognize_faces_in_frame(frame_data)

            for r in results:
                if r['recognized'] and r['student_id'] not in marked_ids:
                    marked_ids.add(r['student_id'])
                    all_results.append(r)

                    if session_id:
                        try:
                            requests.post(
                                f"{BACKEND_URL}/api/attendance/face-result",
                                json={
                                    "sessionId": session_id,
                                    "studentId": r['student_id'],
                                    "confidence": float(r['confidence']),
                                    "status": "present"
                                },
                                timeout=2
                            )
                        except Exception:
                            pass
        except Exception as e:
            logger.error(f"Batch frame error: {e}")
            continue

    return jsonify({
        "success": True,
        "frames_processed": int(len(frames)),
        "unique_recognized": int(len(marked_ids)),
        "results": all_results
    })