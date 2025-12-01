"""
Logs Controller
Provides comprehensive log management for monitoring and dashboard integration.
Handles pagination, filtering, and separation of app and error logs.
"""

import re
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
from math import ceil

from models.logs import (
    LogEntry,
    LogResponse,
    LogPaginationMeta,
    LogStatsResponse,
    ClearLogsResponse
)
from utils.logger import get_logger

logger = get_logger(__name__)

# Log file paths
LOGS_DIR = Path("logs")
APP_LOG_FILE = LOGS_DIR / "app.log"
ERROR_LOG_FILE = LOGS_DIR / "errors.log"

# Log line parsing regex pattern
# Format: 2024-12-01 10:30:45 | INFO     | module.function:123 | Message
LOG_PATTERN = re.compile(
    r'^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\s*\|\s*(\w+)\s*\|\s*([^\|]+)\s*\|\s*(.*)$'
)


def get_log_file_path(log_type: str) -> Path:
    """Get the path for the specified log type."""
    if log_type == "error":
        return ERROR_LOG_FILE
    return APP_LOG_FILE


def parse_log_line(line: str, line_number: int) -> Optional[LogEntry]:
    """
    Parse a single log line into a LogEntry object.
    
    Args:
        line: Raw log line string
        line_number: Line number in the file
        
    Returns:
        LogEntry if parsing succeeds, None otherwise
    """
    line = line.strip()
    if not line:
        return None
    
    match = LOG_PATTERN.match(line)
    if match:
        timestamp, level, logger_name, message = match.groups()
        return LogEntry(
            timestamp=timestamp.strip(),
            level=level.strip(),
            logger=logger_name.strip(),
            message=message.strip(),
            line_number=line_number
        )
    
    # Handle multi-line logs or non-standard format
    return LogEntry(
        timestamp="",
        level="UNKNOWN",
        logger="",
        message=line,
        line_number=line_number
    )


def read_log_file(
    log_path: Path,
    page: int = 1,
    per_page: int = 50,
    level_filter: Optional[str] = None,
    search_query: Optional[str] = None,
    reverse: bool = True
) -> Tuple[List[LogEntry], int]:
    """
    Read and parse log file with pagination and filtering.
    
    Args:
        log_path: Path to the log file
        page: Page number (1-indexed)
        per_page: Number of entries per page
        level_filter: Optional log level to filter by
        search_query: Optional search string
        reverse: Show newest entries first
        
    Returns:
        Tuple of (list of LogEntry, total matching entries)
    """
    if not log_path.exists():
        return [], 0
    
    try:
        with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
            lines = f.readlines()
    except Exception as e:
        logger.error(f"Failed to read log file {log_path}: {str(e)}")
        return [], 0
    
    # Parse all lines
    entries: List[LogEntry] = []
    for i, line in enumerate(lines, start=1):
        entry = parse_log_line(line, i)
        if entry:
            # Apply level filter
            if level_filter and entry.level != level_filter.upper():
                continue
            
            # Apply search filter
            if search_query:
                search_lower = search_query.lower()
                if not (
                    search_lower in entry.message.lower() or
                    search_lower in entry.logger.lower() or
                    search_lower in entry.level.lower()
                ):
                    continue
            
            entries.append(entry)
    
    # Reverse for newest first
    if reverse:
        entries.reverse()
    
    total_entries = len(entries)
    
    # Apply pagination
    start_idx = (page - 1) * per_page
    end_idx = start_idx + per_page
    paginated_entries = entries[start_idx:end_idx]
    
    return paginated_entries, total_entries


def get_file_stats(log_path: Path) -> Dict[str, Any]:
    """
    Get statistics for a log file.
    
    Args:
        log_path: Path to the log file
        
    Returns:
        Dict containing file statistics
    """
    if not log_path.exists():
        return {
            "exists": False,
            "size_bytes": 0,
            "size_human": "0 B",
            "line_count": 0,
            "last_modified": None
        }
    
    try:
        stats = log_path.stat()
        size_bytes = stats.st_size
        
        # Human-readable size
        if size_bytes < 1024:
            size_human = f"{size_bytes} B"
        elif size_bytes < 1024 ** 2:
            size_human = f"{size_bytes / 1024:.2f} KB"
        else:
            size_human = f"{size_bytes / (1024 ** 2):.2f} MB"
        
        # Count lines
        with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
            line_count = sum(1 for _ in f)
        
        # Last modified time
        last_modified = datetime.fromtimestamp(stats.st_mtime).isoformat() + "Z"
        
        return {
            "exists": True,
            "size_bytes": size_bytes,
            "size_human": size_human,
            "line_count": line_count,
            "last_modified": last_modified,
            "path": str(log_path.absolute())
        }
    except Exception as e:
        logger.error(f"Failed to get stats for {log_path}: {str(e)}")
        return {
            "exists": True,
            "size_bytes": 0,
            "size_human": "0 B",
            "line_count": 0,
            "last_modified": None,
            "error": str(e)
        }


def count_log_levels(log_path: Path) -> Dict[str, int]:
    """
    Count occurrences of each log level in a file.
    
    Args:
        log_path: Path to the log file
        
    Returns:
        Dict mapping log level to count
    """
    counts = {
        "DEBUG": 0,
        "INFO": 0,
        "WARNING": 0,
        "ERROR": 0,
        "CRITICAL": 0,
        "UNKNOWN": 0
    }
    
    if not log_path.exists():
        return counts
    
    try:
        with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
            for line in f:
                entry = parse_log_line(line.strip(), 0)
                if entry:
                    level = entry.level.upper()
                    if level in counts:
                        counts[level] += 1
                    else:
                        counts["UNKNOWN"] += 1
    except Exception as e:
        logger.error(f"Failed to count log levels: {str(e)}")
    
    return counts


async def get_logs(
    log_type: str = "app",
    page: int = 1,
    per_page: int = 50,
    level: Optional[str] = None,
    search: Optional[str] = None
) -> LogResponse:
    """
    Get paginated logs with optional filtering.
    
    Args:
        log_type: Type of log ('app' or 'error')
        page: Page number (1-indexed)
        per_page: Number of entries per page (max 100)
        level: Optional log level filter
        search: Optional search query
        
    Returns:
        LogResponse with paginated entries and metadata
    """
    # Validate and sanitize inputs
    page = max(1, page)
    per_page = min(max(1, per_page), 100)
    
    log_path = get_log_file_path(log_type)
    
    logger.info(f"Fetching {log_type} logs - page: {page}, per_page: {per_page}")
    
    entries, total_entries = read_log_file(
        log_path,
        page=page,
        per_page=per_page,
        level_filter=level,
        search_query=search
    )
    
    total_pages = ceil(total_entries / per_page) if total_entries > 0 else 1
    
    meta = LogPaginationMeta(
        current_page=page,
        per_page=per_page,
        total_entries=total_entries,
        total_pages=total_pages,
        has_next=page < total_pages,
        has_previous=page > 1
    )
    
    return LogResponse(
        log_type=log_type,
        entries=entries,
        meta=meta
    )


async def get_log_stats() -> LogStatsResponse:
    """
    Get comprehensive statistics for all log files.
    
    Returns:
        LogStatsResponse with file stats and level counts
    """
    app_stats = get_file_stats(APP_LOG_FILE)
    error_stats = get_file_stats(ERROR_LOG_FILE)
    
    app_levels = count_log_levels(APP_LOG_FILE)
    error_levels = count_log_levels(ERROR_LOG_FILE)
    
    # Add level counts to stats
    app_stats["level_counts"] = app_levels
    error_stats["level_counts"] = error_levels
    
    # Summary statistics
    summary = {
        "total_log_files": 2,
        "total_size_bytes": app_stats.get("size_bytes", 0) + error_stats.get("size_bytes", 0),
        "total_entries": app_stats.get("line_count", 0) + error_stats.get("line_count", 0),
        "total_errors": app_levels.get("ERROR", 0) + error_levels.get("ERROR", 0),
        "total_warnings": app_levels.get("WARNING", 0) + error_levels.get("WARNING", 0),
        "total_critical": app_levels.get("CRITICAL", 0) + error_levels.get("CRITICAL", 0),
    }
    
    logger.info("Log statistics retrieved successfully")
    
    return LogStatsResponse(
        app_log=app_stats,
        error_log=error_stats,
        summary=summary
    )


async def clear_logs(log_type: Optional[str] = None) -> ClearLogsResponse:
    """
    Clear log files.
    
    Args:
        log_type: Optional specific log type to clear ('app' or 'error')
                  If None, clears all logs
                  
    Returns:
        ClearLogsResponse with operation result
    """
    cleared_files = []
    
    try:
        if log_type is None or log_type == "app":
            if APP_LOG_FILE.exists():
                with open(APP_LOG_FILE, 'w') as f:
                    f.write("")
                cleared_files.append("app.log")
                logger.info("App log file cleared")
        
        if log_type is None or log_type == "error":
            if ERROR_LOG_FILE.exists():
                with open(ERROR_LOG_FILE, 'w') as f:
                    f.write("")
                cleared_files.append("errors.log")
                logger.info("Error log file cleared")
        
        return ClearLogsResponse(
            success=True,
            message=f"Successfully cleared {len(cleared_files)} log file(s)",
            cleared_files=cleared_files
        )
        
    except Exception as e:
        logger.error(f"Failed to clear logs: {str(e)}")
        return ClearLogsResponse(
            success=False,
            message=f"Failed to clear logs: {str(e)}",
            cleared_files=cleared_files
        )


async def download_log(log_type: str = "app") -> Tuple[Optional[bytes], str]:
    """
    Get log file content for download.
    
    Args:
        log_type: Type of log ('app' or 'error')
        
    Returns:
        Tuple of (file content bytes, filename)
    """
    log_path = get_log_file_path(log_type)
    filename = f"{log_type}_log_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
    
    if not log_path.exists():
        return None, filename
    
    try:
        with open(log_path, 'rb') as f:
            content = f.read()
        return content, filename
    except Exception as e:
        logger.error(f"Failed to read log file for download: {str(e)}")
        return None, filename
