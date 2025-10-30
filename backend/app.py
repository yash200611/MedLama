"""
Main Flask application for MedLama backend
"""
from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
import os

from backend.config import get_config
from backend.middleware.error_handler import register_error_handlers
from backend.routes.chat import chat_bp
from backend.routes.streaming import streaming_bp
from backend.routes.quiz import quiz_bp
from backend.utils.logger import setup_logger
from backend.services.database import init_database

logger = setup_logger(__name__)


def create_app(config_name=None):
    """
    Application factory
    
    Args:
        config_name: Configuration name (development, production, testing)
        
    Returns:
        Flask application instance
    """
    app = Flask(
        __name__,
        static_folder="../medLama/out",
        static_url_path="/"
    )
    
    # Load configuration
    config = get_config(config_name)
    app.config.from_object(config)
    
    # Validate configuration
    try:
        config.validate()
    except ValueError as e:
        logger.error(f"Configuration validation failed: {str(e)}")
        logger.warning("Some features may not work without proper configuration")
    
    # Initialize database
    try:
        init_database(app.config['MONGODB_URI'], app.config['DATABASE_NAME'])
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {str(e)}")
        logger.warning("Running without database - some features will be limited")
    
    # Setup CORS
    CORS(app, origins=app.config['ALLOWED_ORIGINS'])
    
    # Register error handlers
    register_error_handlers(app)
    
    # Register blueprints
    app.register_blueprint(chat_bp)
    app.register_blueprint(streaming_bp)
    app.register_blueprint(quiz_bp)
    
    # Register routes
    register_routes(app)
    
    logger.info(f"Application created with config: {config_name or 'default'}")
    
    return app


def register_routes(app):
    """
    Register application routes
    
    Args:
        app: Flask application instance
    """
    
    @app.route('/')
    def index():
        """Serve the frontend"""
        index_path = os.path.join(app.static_folder, "index.html")
        if os.path.exists(index_path):
            return send_from_directory(app.static_folder, "index.html")
        return jsonify({
            'message': 'MedLama API',
            'version': '1.0.0',
            'status': 'running'
        }), 200
    
    @app.route('/<path:path>')
    def serve_static(path):
        """Serve static files"""
        file_path = os.path.join(app.static_folder, path)
        if os.path.exists(file_path):
            return send_from_directory(app.static_folder, path)
        # Fallback to index.html for client-side routing
        index_path = os.path.join(app.static_folder, "index.html")
        if os.path.exists(index_path):
            return send_from_directory(app.static_folder, "index.html")
        return jsonify({'error': 'Not found'}), 404
    
    @app.route('/api/health')
    def health():
        """Health check endpoint"""
        return jsonify({
            'status': 'healthy',
            'service': 'medlama-api',
            'version': '1.0.0'
        }), 200
    
    # Legacy endpoint for backward compatibility
    @app.route('/api/llm/response/')
    def legacy_prompt():
        """Legacy endpoint - redirects to new API"""
        from flask import request, redirect, url_for
        message = request.args.get("message", "")
        
        # For now, return a migration message
        return jsonify({
            'message': 'This endpoint is deprecated. Please use POST /api/v1/chat/message',
            'migration_guide': {
                'old': 'GET /api/llm/response/?message=...',
                'new': 'POST /api/v1/chat/message with JSON body {"message": "..."}'
            }
        }), 200


# Create application instance
app = create_app()


if __name__ == "__main__":
    # Get configuration
    env = os.getenv('FLASK_ENV', 'development')
    debug = env == 'development'
    
    # Run application
    logger.info(f"Starting MedLama backend in {env} mode")
    app.run(
        host="127.0.0.1" if debug else "0.0.0.0",
        port=5002,
        debug=debug
    )
