import logging
import logging.handlers
from pathlib import Path
import os

class NoTracebackFormatter(logging.Formatter):
    """Custom formatter that excludes traceback from error logs"""
    
    def __init__(self, *args, include_traceback=False, **kwargs):
        super().__init__(*args, **kwargs)
        self.include_traceback = include_traceback
    
    def formatException(self, exc_info):
        """Override to return empty string instead of full traceback"""
        if self.include_traceback:
            return super().formatException(exc_info)
        return ""
    
    def format(self, record):
        """Format the record and optionally include exception info"""
        # Store original exc_text
        original_exc_text = record.exc_text
        
        # Clear exc_text to prevent traceback
        record.exc_text = None
        
        # If there's an exception, add a concise error message
        if record.exc_info and not self.include_traceback:
            exc_type, exc_value, _ = record.exc_info
            record.msg = f"{record.msg} [{exc_type.__name__}]: {str(exc_value)[:200]}"
            record.exc_info = None  # Clear to prevent traceback
        
        result = super().format(record)
        
        # Restore original exc_text
        record.exc_text = original_exc_text
        
        return result

def setup_logger():
    """Setup logging to files only (no terminal output)"""

    Path("logs").mkdir(exist_ok=True)
    
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    
    logger.handlers.clear()
    
    # Check if we're in debug mode (set DEBUG=true in .env for full tracebacks)
    debug_mode = os.getenv("DEBUG", "false").lower() == "true"
    
    # Create file handler with rotation (so files don't get too big)
    file_handler = logging.handlers.RotatingFileHandler(
        filename='logs/app.log',
        maxBytes=10 * 1024 * 1024,  # 10MB max file size
        backupCount=5,  # Keep 5 backup files
        encoding='utf-8'
    )
    
    # Create error-only file handler
    error_handler = logging.handlers.RotatingFileHandler(
        filename='logs/errors.log',
        maxBytes=10 * 1024 * 1024,
        backupCount=5,
        encoding='utf-8'
    )
    error_handler.setLevel(logging.ERROR)
    
    # Create formatter - use NoTracebackFormatter for cleaner logs
    formatter = NoTracebackFormatter(
        fmt='%(asctime)s | %(levelname)-8s | %(name)s.%(funcName)s:%(lineno)d | %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S',
        include_traceback=debug_mode  # Enable tracebacks in debug mode
    )
    
    # Apply formatter to handlers
    file_handler.setFormatter(formatter)
    error_handler.setFormatter(formatter)
    
    # Add handlers to logger
    logger.addHandler(file_handler)
    logger.addHandler(error_handler)
    
    # Reduce noise from external libraries
    logging.getLogger('uvicorn').setLevel(logging.WARNING)
    logging.getLogger('fastapi').setLevel(logging.WARNING)
    logging.getLogger('httpx').setLevel(logging.WARNING)
    
    print(f"Logging setup complete. Logs saved to:")
    print(f"All logs: logs/app.log")
    print(f"Errors only: logs/errors.log")
    print(f"Debug mode (full tracebacks): {debug_mode}")

def get_logger(name: str = None):
    """Get a logger for your module"""
    return logging.getLogger(name or __name__)
