"""Fallback Service - Reusable fallback handling for AI response parsing"""
from typing import TypeVar, Type, Dict, Any, Optional, Callable
from pydantic import BaseModel, ValidationError
import logging

logger = logging.getLogger(__name__)

T = TypeVar('T', bound=BaseModel)


class FallbackService:
    """
    A generic fallback service for handling AI response parsing failures.
    Provides graceful degradation when AI responses don't match expected schemas.
    """
    
    @staticmethod
    def parse_with_fallback(
        raw_data: Optional[Dict[str, Any]],
        model_class: Type[T],
        fallback_factory: Callable[[Optional[Dict[str, Any]], str], T],
        error_msg: str = ""
    ) -> tuple[T, bool]:
        """
        Attempt to parse raw_data into model_class, using fallback_factory on failure.
        
        Args:
            raw_data: The parsed JSON data to validate
            model_class: The Pydantic model class to validate against
            fallback_factory: A function that creates a fallback instance
            error_msg: Error message for logging
            
        Returns:
            tuple[T, bool]: (parsed model instance, success flag)
        """
        if raw_data is None:
            logger.warning(f"No data provided. Using fallback. Reason: {error_msg}")
            return fallback_factory(None, error_msg), False
            
        try:
            result = model_class(**raw_data)
            return result, True
        except ValidationError as ve:
            logger.warning(f"Pydantic validation failed: {ve}")
            return fallback_factory(raw_data, f"Validation error: {ve}"), False
        except Exception as e:
            logger.error(f"Unexpected error during parsing: {e}")
            return fallback_factory(raw_data, f"Unexpected error: {e}"), False

    @staticmethod
    def safe_get(data: Optional[Dict], key: str, default: Any = None) -> Any:
        """Safely get a value from a dict, returning default if not found or invalid"""
        if data is None or not isinstance(data, dict):
            return default
        return data.get(key, default)

    @staticmethod
    def safe_get_list(data: Optional[Dict], key: str, default: list = None) -> list:
        """Safely get a list from a dict, returning default if not found or not a list"""
        if default is None:
            default = []
        if data is None or not isinstance(data, dict):
            return default
        value = data.get(key)
        if isinstance(value, list):
            return value
        return default

    @staticmethod
    def safe_get_dict(data: Optional[Dict], key: str, default: dict = None) -> dict:
        """Safely get a dict from a dict, returning default if not found or not a dict"""
        if default is None:
            default = {}
        if data is None or not isinstance(data, dict):
            return default
        value = data.get(key)
        if isinstance(value, dict):
            return value
        return default

    @staticmethod
    def safe_get_string(data: Optional[Dict], key: str, default: str = "") -> str:
        """
        Safely get a string from a dict. If the value is a list, join it with newlines.
        
        Args:
            data: The dictionary to get the value from
            key: The key to look up
            default: Default value if key not found or value is None
            
        Returns:
            str: The value as a string, or default if not found
        """
        if data is None or not isinstance(data, dict):
            return default
        value = data.get(key)
        if value is None:
            return default
        if isinstance(value, str):
            return value
        if isinstance(value, list):
            # Join list items with newlines, converting each item to string
            return "\n".join(str(item) for item in value if item)
        # For any other type, convert to string
        return str(value)

    @staticmethod
    def extract_items_with_required_field(
        items: list,
        required_field: str,
        item_factory: Callable[[Dict], Any]
    ) -> list:
        """
        Extract valid items from a list, filtering by required field.
        
        Args:
            items: List of raw dict items
            required_field: The field that must be present
            item_factory: Function to create model instance from dict
            
        Returns:
            List of successfully created model instances
        """
        result = []
        for item in items:
            if isinstance(item, dict) and required_field in item:
                try:
                    result.append(item_factory(item))
                except Exception as e:
                    logger.warning(f"Failed to create item: {e}")
        return result
