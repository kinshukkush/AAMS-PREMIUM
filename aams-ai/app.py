import os
import base64
import uuid
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from deepface import DeepFace

app = Flask(__name__)
CORS(app)

TEMP_DIR = "temp_images"
os.makedirs(TEMP_DIR, exist_ok=True)

def save_base64_image(base64_str):
    if "," in base64_str:
        base64_str = base64_str.split(",")[1]
    
    img_data = base64.b64decode(base64_str)
    filename = os.path.join(TEMP_DIR, f"{uuid.uuid4().hex}.jpg")
    with open(filename, "wb") as f:
        f.write(img_data)
    return filename

def compute_cosine_similarity(vec1, vec2):
    vec1 = np.array(vec1)
    vec2 = np.array(vec2)
    dot = np.dot(vec1, vec2)
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return float(dot / (norm1 * norm2))

@app.route("/register", methods=["POST"])
def register():
    try:
        data = request.json
        if not data or "image" not in data:
            return jsonify({"success": False, "error": "Image is required"}), 400
        
        img_path = save_base64_image(data["image"])
        
        try:
            result = DeepFace.represent(img_path=img_path, model_name="Facenet", enforce_detection=True)
            if len(result) == 0:
                os.remove(img_path)
                return jsonify({"success": False, "error": "No face detected"}), 400
            embedding = result[0]["embedding"]
        except Exception as e:
            os.remove(img_path)
            return jsonify({"success": False, "error": f"Failed to detect face: {str(e)}"}), 400
            
        os.remove(img_path)
        
        return jsonify({"success": True, "embedding": embedding})
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/recognize", methods=["POST"])
def recognize():
    try:
        data = request.json
        if not data or "image" not in data or "candidates" not in data:
            return jsonify({"success": False, "error": "Image and candidates are required"}), 400
            
        img_path = save_base64_image(data["image"])
        candidates = data["candidates"]
        
        if not candidates:
            os.remove(img_path)
            return jsonify({"success": False, "error": "No candidates provided"}), 400
            
        try:
            result = DeepFace.represent(img_path=img_path, model_name="Facenet", enforce_detection=True)
            target_embedding = result[0]["embedding"]
        except Exception as e:
            os.remove(img_path)
            return jsonify({"success": False, "error": f"Failed to detect face: {str(e)}"}), 400
            
        os.remove(img_path)
        
        best_match = None
        highest_similarity = -1.0
        
        for candidate in candidates:
            sim = compute_cosine_similarity(target_embedding, candidate["embedding"])
            if sim > highest_similarity:
                highest_similarity = sim
                best_match = candidate
                
        # Threshold > 0.6 as per prompt
        if highest_similarity > 0.6 and best_match:
            return jsonify({
                "success": True, 
                "recognized": True, 
                "enrollmentId": best_match.get("enrollmentId"), 
                "confidence": highest_similarity
            })
        else:
            return jsonify({
                "success": True, 
                "recognized": False
            })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
