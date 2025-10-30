"""
Global error handling middleware
"""
from flask import jsonify
from werkzeug.exceptions import HTTPException
import traceback
from datetime import datetime

from backend.utils.logger import setup_logger

logger = setup_logger(__name__)


class APIError(Exception):
    """Base API error class"""
    
    def __init__(self, message: str, status_code: int = 400, error_code: str = None, details: dict = None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.error_code = error_code or 'API_ERROR'
        self.details = details or {}


class ValidationError(APIError):
    """Validation error"""
    
    def __init__(self, message: str, details: dict = None):
        super().__init__(message, 400, 'VALIDATION_ERROR', details)


class AuthenticationError(APIError):
    """Authentication error"""
    
    def __init__(self, message: str = "Authentication required"):
        super().__init__(message, 401, 'AUTHENTICATION_ERROR')


class AuthorizationError(APIError):
    """Authorization error"""
    
    def __init__(self, message: str = "Insufficient permissions"):
        super().__init__(message, 403, 'AUTHORIZATION_ERROR')


class NotFoundError(APIError):
    """Resource not found error"""
    
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, 404, 'NOT_FOUND')


class RateLimitError(APIError):
    """Rate limit exceeded error"""
    
    def __init__(self, message: str = "Rate limit exceeded"):
        super().__init__(message, 429, 'RATE_LIMIT_EXCEEDED')


class AIServiceError(APIError):
    """AI service error"""
    
    def __init__(self, message: str = "AI service error"):
        super().__init__(message, 503, 'AI_SERVICE_ERROR')


def register_error_handlers(app):
    """
    Register error handlers with Flask app
    
    Args:
        app: Flask application instance
    """
    
    @app.errorhandler(APIError)
    def handle_api_error(error):
        """Handle custom API errors"""
        logger.error(f"API Error: {error.message}", exc_info=True)
        
        response = {
            'error': {
                'code': error.error_code,
                'message': error.message,
                'details': error.details,
                'timestamp': datetime.utcnow().isoformat() + 'Z'
            }
        }
        
        return jsonify(response), error.status_code
    
    @app.errorhandler(HTTPException)
    def handle_http_exception(error):
        """Handle HTTP exceptions"""
        logger.warning(f"HTTP Exception: {error.description}")
        
        response = {
            'error': {
                'code': 'HTTP_ERROR',
                'message': error.description,
                'timestamp': datetime.utcnow().isoformat() + 'Z'
            }
        }
        
        return jsonify(response), error.code
    
    @app.errorhandler(Exception)
    def handle_unexpected_error(error):
        """Handle unexpected errors"""
        logger.error(f"Unexpected error: {str(error)}", exc_info=True)
        
        # Don't expose internal errors in production
        if app.config.get('DEBUG'):
            message = str(error)
            details = {'traceback': traceback.format_exc()}
        else:
            message = "An unexpected error occurred"
            details = {}
        
        response = {
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': message,
                'details': details,
                'timestamp': datetime.utcnow().isoformat() + 'Z'
            }
        }
        
        return jsonify(response), 500
    
    @app.errorhandler(404)
    def handle_not_found(error):
        """Handle 404 errors"""
        response = {
            'error': {
                'code': 'NOT_FOUND',
                'message': 'The requested resource was not found',
                'timestamp': datetime.utcnow().isoformat() + 'Z'
            }
        }
        
        return jsonify(response), 404
    
    @app.errorhandler(405)
    def handle_method_not_allowed(error):
        """Handle 405 errors"""
        response = {
            'error': {
                'code': 'METHOD_NOT_ALLOWED',
                'message': 'The method is not allowed for the requested URL',
                'timestamp': datetime.utcnow().isoformat() + 'Z'
            }
        }
        
        return jsonify(response), 405
