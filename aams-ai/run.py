"""
AAMS AI Service — Entry Point
Run: python run.py
Production: gunicorn -w 2 -b 0.0.0.0:8000 run:app
"""

import os
import logging
from dotenv import load_dotenv
load_dotenv()

from app import create_app
from app.services.face_service import load_all_encodings, ensure_dirs

logger = logging.getLogger(__name__)
app = create_app()

if __name__ == '__main__':
    PORT = int(os.getenv('PORT', 8000))
    DEBUG = os.getenv('DEBUG', 'true').lower() == 'true'

    print('\n' + '━' * 52)
    print('🤖 AAMS Face Recognition Service Starting...')
    print(f'📡 API:       http://localhost:{PORT}/api')
    print(f'❤️  Health:    http://localhost:{PORT}/api/health')
    print(f'🔍 Model:     {os.getenv("FACE_RECOGNITION_MODEL", "hog").upper()}')
    print(f'🎯 Tolerance: {os.getenv("FACE_RECOGNITION_TOLERANCE", "0.5")}')
    print(f'🌍 Debug:     {DEBUG}')
    print('━' * 52)

    # Pre-load all face encodings into memory on startup
    print('\n📦 Loading face encodings...')
    ensure_dirs()
    cache = load_all_encodings()
    print(f'✅ Loaded {len(cache)} student(s) into recognition cache\n')

    app.run(host='0.0.0.0', port=PORT, debug=DEBUG, threaded=True)
