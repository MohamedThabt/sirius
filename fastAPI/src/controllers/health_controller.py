"""
Health Check Controller
Provides system health status for monitoring and dashboard integration.
"""

import os
import platform
import psutil
from datetime import datetime
from typing import Dict, Any

from utils.logger import get_logger

logger = get_logger(__name__)


def get_disk_path() -> str:
    """Get the appropriate disk path based on the operating system."""
    if platform.system() == "Windows":
        return os.environ.get("SystemDrive", "C:") + "\\"
    return "/"


async def get_health_status() -> Dict[str, Any]:
    """
    Get comprehensive health status of the FastAPI service.
    
    Returns:
        Dict containing health status information including:
        - status: overall health status (healthy/unhealthy)
        - timestamp: current server time
        - uptime: service uptime information
        - system: CPU, memory, and disk usage
        - version: API version
    """
    try:
        # Get system metrics
        cpu_percent = psutil.cpu_percent(interval=0.1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage(get_disk_path())
        
        # Determine health status based on system resources
        is_healthy = (
            cpu_percent < 90 and 
            memory.percent < 90 and 
            disk.percent < 90
        )
        
        health_data = {
            "status": "healthy" if is_healthy else "degraded",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "service": "FastAPI Requirements Generator",
            "version": "1.0.0",
            "system": {
                "cpu_percent": round(cpu_percent, 2),
                "memory_percent": round(memory.percent, 2),
                "memory_used_gb": round(memory.used / (1024 ** 3), 2),
                "memory_total_gb": round(memory.total / (1024 ** 3), 2),
                "disk_percent": round(disk.percent, 2),
                "disk_used_gb": round(disk.used / (1024 ** 3), 2),
                "disk_total_gb": round(disk.total / (1024 ** 3), 2),
            },
            "checks": {
                "api": True,
                "cpu_ok": cpu_percent < 90,
                "memory_ok": memory.percent < 90,
                "disk_ok": disk.percent < 90,
            }
        }
        
        logger.info("Health check completed", extra={"status": health_data["status"]})
        return health_data
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "service": "FastAPI Requirements Generator",
            "version": "1.0.0",
            "error": str(e),
            "checks": {
                "api": True,
                "cpu_ok": False,
                "memory_ok": False,
                "disk_ok": False,
            }
        }


async def get_simple_health() -> Dict[str, str]:
    """
    Simple health check endpoint for load balancers and quick status checks.
    
    Returns:
        Dict with simple status message
    """
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
