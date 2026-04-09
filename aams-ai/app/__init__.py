from flask import Flask
from flask_cors import CORS
import logging
import os
from dotenv import load_dotenv

load_dotenv()

def create_app():
    app = Flask(__name__)

    logging.basicConfig(
        level=logging.DEBUG if os.getenv('DEBUG', 'true').lower() == 'true' else logging.INFO,
        format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )

    # Restrict CORS to backend only - SECURITY FIX
    backend_url = os.getenv('BACKEND_URL', 'http://localhost:5000')
    CORS(app,
         origins=[backend_url],
         allow_headers=["Content-Type", "Authorization"],
         methods=["GET", "POST"],
         supports_credentials=False,
         max_age=600
    )

    app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024

    # Handle OPTIONS preflight requests explicitly
    @app.after_request
    def after_request(response):
        response.headers.add('Access-Control-Allow-Origin', backend_url)
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
        response.headers.add('X-Content-Type-Options', 'nosniff')
        response.headers.add('X-Frame-Options', 'DENY')
        return response

    from app.routes.api import api_bp
    app.register_blueprint(api_bp)

    @app.route('/')
    def index():
        return {
            "service": "AAMS Face Recognition Service",
            "version": "1.0.0",
            "status": "running"
        }

    return app