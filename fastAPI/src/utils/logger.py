import logging
import logging.handlers
from pathlib import Path

def setup_logger():
    """Setup logging to files only (no terminal output)"""

    Path("logs").mkdir(exist_ok=True)
    

    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    

    logger.handlers.clear()
    
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
    
    # Create formatter
    formatter = logging.Formatter(
        fmt='%(asctime)s | %(levelname)-8s | %(name)s.%(funcName)s:%(lineno)d | %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
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

def get_logger(name: str = None):
    """Get a logger for your module"""
    return logging.getLogger(name or __name__)
