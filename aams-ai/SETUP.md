# 🤖 AAMS AI Service - Setup Guide

**Quick Setup**: 10 minutes
**Full Setup**: 20 minutes

---

## 📋 Prerequisites

- Python 3.8+ installed
- pip package manager
- CUDA 11.8+ (optional, for GPU acceleration)
- Redis 7.0+ running (for caching)
- 2GB free disk space (for models)

---

## ⚡ Quick Start (10 Minutes)

### Option 1: Using Docker Compose (Recommended)

```bash
# From project root
docker-compose up -d ai-service

# AI Service runs on: http://localhost:5001
# Access logs: docker-compose logs -f ai-service
```

### Option 2: Local Installation

```bash
# 1. Create virtual environment
python -m venv venv

# 2. Activate virtual environment
# Windows:
venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create environment file
cp .env.example .env

# 5. Download face detection models
python scripts/download_models.py

# 6. Start AI service
python src/app.py

# AI Service runs on: http://localhost:5001
```

---

## 🔧 Full Setup (20 Minutes)

### Step 1: Create Virtual Environment

```bash
# Create virtual environment
python3 -m venv venv

# Activate it
# macOS/Linux:
source venv/bin/activate

# Windows:
venv\Scripts\activate

# You should see (venv) in your terminal
```

### Step 2: Install Dependencies

```bash
# Upgrade pip
pip install --upgrade pip

# Install requirements
pip install -r requirements.txt

# Verify installation
python -c "import cv2; import face_recognition; print('OK')"
```

### Step 3: Configure Environment

```bash
# Copy template
cp .env.example .env

# Edit with your values
nano .env
```

**Key Environment Variables:**

```env
# Service
PORT=5001
HOST=0.0.0.0
DEBUG=False

# Database
REDIS_URL=redis://localhost:6379
REDIS_PASS=redis_password

# Face Recognition
FACE_MODEL_PATH=./models
FACE_ENCODING_CACHE=redis  # redis or local
FACE_CONFIDENCE_THRESHOLD=0.6
FACE_DISTANCE_THRESHOLD=0.5
FACE_ENCODING_SIZE=128

# Processing
MAX_WORKERS=4
REQUEST_TIMEOUT=30
BATCH_SIZE=32

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json
```

### Step 4: Download Face Detection Models

```bash
# Create models directory
mkdir -p models

# Download models
python scripts/download_models.py

# Models downloaded:
# - dlib_face_recognition_resnet_model_v1.dat (~23MB)
# - shape_predictor_68_face_landmarks.dat (~100MB)
# - mmod_human_face_detector.dat (~100MB)

# Total: ~220MB
```

### Step 5: Start AI Service

```bash
# Development
python src/app.py

# Or with gunicorn (production)
gunicorn --workers 4 --bind 0.0.0.0:5001 src.app:app
```

**Output:**
```
* Running on http://0.0.0.0:5001
* Face recognition model loaded
* Cache initialized (Redis)
* Ready to process requests
```

---

## 🧪 Verify Installation

### Health Check

```bash
curl http://localhost:5001/health

# Expected response:
# {
#   "status": "ok",
#   "models_loaded": true,
#   "cache": "connected",
#   "gpu": false,
#   "version": "1.0.0"
# }
```

### Register Face

```bash
# Upload face images for a student

curl -X POST http://localhost:5001/api/face/register \
  -H "Authorization: Bearer <TOKEN>" \
  -F "userId=507f1f77bcf86cd799439011" \
  -F "images=@image1.jpg" \
  -F "images=@image2.jpg"

# Expected response:
# {
#   "status": "success",
#   "userId": "507f1f77bcf86cd799439011",
#   "faces_registered": 2,
#   "encoding_size": 128
# }
```

### Recognize Face

```bash
# Recognize face from webcam image

curl -X POST http://localhost:5001/api/face/recognize \
  -H "Authorization: Bearer <TOKEN>" \
  -F "image=@face.jpg" \
  -F "sessionId=507f1f77bcf86cd799439012"

# Expected response:
# {
#   "status": "success",
#   "matches": [
#     {
#       "userId": "507f1f77bcf86cd799439011",
#       "confidence": 0.92,
#       "distance": 0.35
#     }
#   ]
# }
```

---

## 📦 Available Python Scripts

```bash
# Download face models
python scripts/download_models.py

# Verify face models
python scripts/verify_models.py

# Test face recognition
python scripts/test_recognition.py --image path/to/image.jpg

# Benchmark performance
python scripts/benchmark.py

# Clear face cache
python scripts/clear_cache.py

# Migrate models
python scripts/migrate_models.py
```

---

## 📂 Project Structure

```
aams-ai/
├── src/
│   ├── app.py              # Flask application
│   ├── routes/             # API routes
│   │   ├── health.py
│   │   ├── face.py
│   │   └── cache.py
│   │
│   ├── models/             # ML models
│   │   ├── face_recognizer.py
│   │   ├── face_detector.py
│   │   └── predictor.py
│   │
│   ├── services/           # Business logic
│   │   ├── recognition.py
│   │   ├── detection.py
│   │   └── cache.py
│   │
│   ├── utils/              # Utilities
│   │   ├── logger.py
│   │   ├── validators.py
│   │   └── image_processor.py
│   │
│   └── config.py           # Configuration
│
├── scripts/                # Helper scripts
│   ├── download_models.py
│   ├── verify_models.py
│   ├── test_recognition.py
│   ├── benchmark.py
│   └── clear_cache.py
│
├── models/                 # Downloaded models (created at runtime)
│   ├── dlib_face_recognition_resnet_model_v1.dat
│   ├── shape_predictor_68_face_landmarks.dat
│   └── mmod_human_face_detector.dat
│
├── requirements.txt        # Python dependencies
├── Dockerfile             # Docker image
├── .env.example           # Environment template
└── SETUP.md               # This file
```

---

## 🧠 Face Recognition Models

### Model Details

1. **dlib_face_recognition_resnet_model_v1.dat** (~23MB)
   - Generates 128-dimensional face encodings
   - ResNet architecture
   - Accurate matching with distance threshold

2. **shape_predictor_68_face_landmarks.dat** (~100MB)
   - Detects 68 facial landmarks
   - Used for face alignment
   - Improves recognition accuracy

3. **mmod_human_face_detector.dat** (~100MB)
   - Detects multiple faces in image
   - CNN-based detector
   - High accuracy even with partial faces

### Model Download

```bash
# Models are downloaded from official sources
# Location: models/

# If download fails, manually download from:
# http://dlib.net/files/

# Place in models/ directory and verify:
python scripts/verify_models.py
```

---

## 🔐 Security

### API Authentication

All endpoints require JWT token:

```bash
curl -H "Authorization: Bearer <TOKEN>" \
  http://localhost:5001/api/face/register
```

### Face Data Privacy

- Face encodings stored securely
- Original images deleted after processing
- No face images stored on disk
- Cache encrypted with Redis ACL

### Rate Limiting

```env
RATE_LIMIT_REGISTER=30      # 30 per minute
RATE_LIMIT_RECOGNIZE=100    # 100 per minute
RATE_LIMIT_API=1000         # 1000 per minute
```

---

## 📊 Performance Tuning

### CPU vs GPU

**CPU Processing:**
```env
USE_GPU=False
MAX_WORKERS=4
```

**GPU Processing (CUDA):**
```bash
# Install CUDA support
pip install torch torchvision torchaudio

# Configure
USE_GPU=True
CUDA_DEVICE=0
```

### Cache Configuration

```env
# Use Redis for fast lookups
FACE_ENCODING_CACHE=redis

# Cache TTL (time to live)
CACHE_TTL=86400  # 24 hours

# Cache size
CACHE_SIZE=10000  # max 10,000 faces
```

### Batch Processing

```env
# Process multiple images
BATCH_SIZE=32
ENABLE_BATCH_PROCESSING=True
```

---

## 🐛 Troubleshooting

### Import Error: No module named 'cv2'

```bash
# Make sure virtual environment is activated
source venv/bin/activate

# Reinstall OpenCV
pip install opencv-python --force-reinstall
```

### Models Not Found

```bash
# Download models
python scripts/download_models.py

# Verify models
python scripts/verify_models.py

# Check models exist
ls -la models/
```

### Redis Connection Error

```bash
# Check Redis is running
redis-cli ping

# Start Redis
# Docker: docker run -d -p 6379:6379 redis:7
# macOS: brew services start redis
# Linux: sudo systemctl start redis
```

### Port 5001 Already in Use

```bash
# Find process using port
lsof -i :5001

# Kill process
kill -9 <PID>

# Or use different port
PORT=5002 python src/app.py
```

### Out of Memory Error

```bash
# Reduce batch size
BATCH_SIZE=16

# Reduce cache size
CACHE_SIZE=5000

# Or increase system memory
```

### Face Recognition Not Working

```bash
# Verify models loaded
python scripts/verify_models.py

# Test with sample image
python scripts/test_recognition.py --image sample.jpg

# Check face quality
# Face must be clearly visible
# Good lighting required
# Face size > 50x50 pixels
```

---

## 📈 API Endpoints

### Health Check

```bash
GET /health

Response:
{
  "status": "ok",
  "models_loaded": true,
  "cache": "connected",
  "gpu": false,
  "version": "1.0.0"
}
```

### Register Face

```bash
POST /api/face/register
Authorization: Bearer <TOKEN>
Content-Type: multipart/form-data

Parameters:
- userId: string (required)
- images: file[] (required, multiple)

Response:
{
  "status": "success",
  "userId": "507f1f77bcf86cd799439011",
  "faces_registered": 2,
  "encoding_size": 128
}
```

### Recognize Face

```bash
POST /api/face/recognize
Authorization: Bearer <TOKEN>
Content-Type: multipart/form-data

Parameters:
- image: file (required)
- sessionId: string (optional)
- threshold: float (optional, default: 0.6)

Response:
{
  "status": "success",
  "matches": [
    {
      "userId": "507f1f77bcf86cd799439011",
      "confidence": 0.92,
      "distance": 0.35
    }
  ]
}
```

### Update Face

```bash
PUT /api/face/{userId}
Authorization: Bearer <TOKEN>
Content-Type: multipart/form-data

Parameters:
- images: file[] (required)

Response:
{
  "status": "success",
  "userId": "507f1f77bcf86cd799439011",
  "faces_updated": 3
}
```

### Delete Face

```bash
DELETE /api/face/{userId}
Authorization: Bearer <TOKEN>

Response:
{
  "status": "success",
  "userId": "507f1f77bcf86cd799439011"
}
```

---

## 🔗 Related Documentation

- **[Backend Setup](../aams-backend/SETUP.md)** - Backend setup
- **[Frontend Setup](../aams-frontend/SETUP.md)** - Frontend setup
- **[Mobile Setup](../aams-mobile/SETUP.md)** - Mobile setup
- **[QUICKSTART.md](../QUICKSTART.md)** - Overall quick start

---

## ✅ Setup Checklist

- [ ] Python 3.8+ installed
- [ ] Virtual environment created
- [ ] Dependencies installed: `pip install -r requirements.txt`
- [ ] .env file created and configured
- [ ] Face models downloaded: `python scripts/download_models.py`
- [ ] Models verified: `python scripts/verify_models.py`
- [ ] Redis running
- [ ] AI service started: `python src/app.py`
- [ ] Health check passing: `curl http://localhost:5001/health`
- [ ] Can register and recognize faces

---

## 🚀 Next Steps

1. **Start** AI service: `python src/app.py`
2. **Verify** health: `curl http://localhost:5001/health`
3. **Register** test faces
4. **Test** face recognition
5. **Monitor** performance

---

**Last Updated**: 2024
**Version**: 1.0.0
**Status**: ✅ Ready
