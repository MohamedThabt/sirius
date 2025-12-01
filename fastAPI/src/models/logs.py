"""
Log models for API log management.
Provides structured models for log entries and pagination.
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum


class LogLevel(str, Enum):
    """Log severity levels"""
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"


class LogEntry(BaseModel):
    """Single log entry model"""
    timestamp: str = Field(..., description="Log entry timestamp")
    level: str = Field(..., description="Log level (INFO, ERROR, etc.)")
    logger: str = Field(..., description="Logger name and location")
    message: str = Field(..., description="Log message content")
    line_number: int = Field(..., description="Line number in log file")


class LogPaginationMeta(BaseModel):
    """Pagination metadata for log responses"""
    current_page: int = Field(..., description="Current page number")
    per_page: int = Field(..., description="Items per page")
    total_entries: int = Field(..., description="Total log entries")
    total_pages: int = Field(..., description="Total number of pages")
    has_next: bool = Field(..., description="Has next page")
    has_previous: bool = Field(..., description="Has previous page")


class LogResponse(BaseModel):
    """Paginated log response model"""
    log_type: str = Field(..., description="Type of log (app or error)")
    entries: List[LogEntry] = Field(default_factory=list, description="List of log entries")
    meta: LogPaginationMeta = Field(..., description="Pagination metadata")


class LogStatsResponse(BaseModel):
    """Log statistics response model"""
    app_log: dict = Field(..., description="App log file statistics")
    error_log: dict = Field(..., description="Error log file statistics")
    summary: dict = Field(..., description="Log summary statistics")


class LogSearchRequest(BaseModel):
    """Log search request parameters"""
    query: Optional[str] = Field(None, description="Search query string")
    level: Optional[LogLevel] = Field(None, description="Filter by log level")
    start_date: Optional[str] = Field(None, description="Filter from date (ISO format)")
    end_date: Optional[str] = Field(None, description="Filter to date (ISO format)")


class ClearLogsResponse(BaseModel):
    """Response for log clearing operation"""
    success: bool = Field(..., description="Operation success status")
    message: str = Field(..., description="Operation result message")
    cleared_files: List[str] = Field(default_factory=list, description="List of cleared log files")
