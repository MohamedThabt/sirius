"""
Example FastAPI unit tests for LLM generation services
Tests the core business logic in isolation
"""
import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from datetime import datetime
from src.services.llm_service import LLMService
from src.models.request_models import PRDRequest, FeaturesRequest
from src.models.schemas import PRDSchema, FeaturesSchema


class TestLLMService:
    """Unit tests for LLM Service"""

    @pytest.fixture
    def llm_service(self):
        """Provide LLM service instance"""
        return LLMService()

    @pytest.fixture
    def mock_prd_request(self):
        """Mock PRD generation request"""
        return PRDRequest(
            project_name="E-Commerce Platform",
            project_description="A modern shopping platform with AI recommendations",
            tech_stack="React, Node.js, PostgreSQL",
            target_users="Online shoppers, merchants",
            key_features="Product search, payments, AI recommendations",
        )

    # ==================== Initialization Tests ====================
    
    def test_llm_service_initializes_correctly(self, llm_service):
        """Test LLM service initializes without errors"""
        assert llm_service is not None
        assert hasattr(llm_service, 'generate_prd')
        assert hasattr(llm_service, 'generate_features')
        assert hasattr(llm_service, 'sanitize_input')

    def test_llm_service_loads_api_key(self, llm_service):
        """Test API key is loaded from environment"""
        # Should not raise exception
        assert llm_service.api_key is not None

    # ==================== Input Validation Tests ====================

    def test_prd_request_validates_required_fields(self):
        """Test PRD request requires all fields"""
        with pytest.raises(ValueError):
            PRDRequest(
                project_name="",  # Empty
                project_description="Description",
                tech_stack="React",
            )

    def test_prd_request_validates_field_lengths(self):
        """Test field length validation"""
        with pytest.raises(ValueError):
            PRDRequest(
                project_name="A" * 1000,  # Too long
                project_description="Description",
                tech_stack="React",
            )

    def test_sanitize_removes_malicious_input(self, llm_service):
        """Test input sanitization removes script tags"""
        malicious = "<script>alert('xss')</script>My Project"
        sanitized = llm_service.sanitize_input(malicious)

        assert "<script>" not in sanitized
        assert "alert" not in sanitized
        assert "My Project" in sanitized

    def test_sanitize_handles_sql_injection_attempts(self, llm_service):
        """Test SQL injection protection"""
        sql_injection = "'; DROP TABLE projects; --"
        sanitized = llm_service.sanitize_input(sql_injection)

        assert "DROP TABLE" not in sanitized
        assert sanitized is not None

    def test_sanitize_preserves_legitimate_input(self, llm_service):
        """Test sanitization preserves valid input"""
        valid_input = "My Project - A great app with special chars: !@#$%"
        sanitized = llm_service.sanitize_input(valid_input)

        assert "My Project" in sanitized
        assert "great app" in sanitized

    # ==================== PRD Generation Tests ====================

    @patch('src.services.llm_service.GoogleGenerativeAI')
    def test_generate_prd_success(self, mock_gemini, llm_service, mock_prd_request):
        """Test successful PRD generation"""
        mock_response = MagicMock()
        mock_response.text = "# Product Requirements Document\n\n## Overview\nE-Commerce Platform..."
        mock_gemini.return_value.generate_content.return_value = mock_response

        result = llm_service.generate_prd(mock_prd_request)

        assert result is not None
        assert isinstance(result, str)
        assert "Product Requirements Document" in result
        assert "E-Commerce" in result

    @patch('src.services.llm_service.GoogleGenerativeAI')
    def test_generate_prd_returns_markdown(self, mock_gemini, llm_service, mock_prd_request):
        """Test PRD output is valid markdown"""
        mock_response = MagicMock()
        mock_response.text = """
        # Product Requirements
        
        ## Functional Requirements
        - User login
        - Product search
        """
        mock_gemini.return_value.generate_content.return_value = mock_response

        result = llm_service.generate_prd(mock_prd_request)

        assert result.startswith('#')
        assert '##' in result

    @patch('src.services.llm_service.GoogleGenerativeAI')
    def test_generate_prd_handles_api_error(self, mock_gemini, llm_service, mock_prd_request):
        """Test error handling for API failures"""
        mock_gemini.return_value.generate_content.side_effect = Exception("API Error")

        with pytest.raises(Exception) as exc_info:
            llm_service.generate_prd(mock_prd_request)

        assert "API Error" in str(exc_info.value)

    @patch('src.services.llm_service.GoogleGenerativeAI')
    def test_generate_prd_handles_timeout(self, mock_gemini, llm_service, mock_prd_request):
        """Test timeout handling"""
        mock_gemini.return_value.generate_content.side_effect = TimeoutError("Request timed out")

        with pytest.raises(TimeoutError):
            llm_service.generate_prd(mock_prd_request)

    @patch('src.services.llm_service.GoogleGenerativeAI')
    def test_generate_prd_handles_quota_exceeded(self, mock_gemini, llm_service, mock_prd_request):
        """Test quota limit handling"""
        error = Exception("429 Too Many Requests")
        mock_gemini.return_value.generate_content.side_effect = error

        with pytest.raises(Exception):
            llm_service.generate_prd(mock_prd_request)

    # ==================== Context Truncation Tests ====================

    def test_truncate_context_respects_token_limit(self, llm_service):
        """Test context is truncated to stay within token limits"""
        large_context = "x" * 100000  # ~100K tokens

        truncated = llm_service.truncate_context(
            large_context,
            max_tokens=4000
        )

        # Should be smaller
        assert len(truncated) < len(large_context)
        # Should not exceed token limit (rough estimate)
        assert len(truncated) // 4 < 4000  # Rough conversion: 4 chars per token

    def test_truncate_context_preserves_key_sections(self, llm_service):
        """Test important content is preserved when truncating"""
        context = """
        # Important Project Requirements
        
        The application must have authentication.
        
        Additional less important info...""" + "x" * 50000

        truncated = llm_service.truncate_context(context, max_tokens=1000)

        assert "Important Project Requirements" in truncated
        assert "authentication" in truncated

    def test_truncate_context_handles_empty_input(self, llm_service):
        """Test truncation handles empty input gracefully"""
        result = llm_service.truncate_context("", max_tokens=1000)
        assert result == ""

    # ==================== Prompt Engineering Tests ====================

    def test_prompt_includes_project_context(self, llm_service, mock_prd_request):
        """Test that prompt includes necessary project information"""
        prompt = llm_service.build_prd_prompt(mock_prd_request)

        assert "E-Commerce Platform" in prompt
        assert "React" in prompt
        assert "Node.js" in prompt

    def test_prompt_includes_generation_guidelines(self, llm_service, mock_prd_request):
        """Test prompt includes instructions for output format"""
        prompt = llm_service.build_prd_prompt(mock_prd_request)

        # Should ask for structured output
        assert "markdown" in prompt.lower() or "format" in prompt.lower()

    def test_different_requests_generate_different_prompts(self, llm_service):
        """Test prompts vary based on input"""
        request1 = PRDRequest(
            project_name="E-Commerce",
            project_description="Shopping platform",
            tech_stack="React",
        )
        request2 = PRDRequest(
            project_name="Social Network",
            project_description="Social platform",
            tech_stack="Vue",
        )

        prompt1 = llm_service.build_prd_prompt(request1)
        prompt2 = llm_service.build_prd_prompt(request2)

        assert prompt1 != prompt2
        assert "E-Commerce" in prompt1
        assert "Social Network" in prompt2

    # ==================== Response Parsing Tests ====================

    def test_parse_prd_response_extracts_markdown(self, llm_service):
        """Test PRD parsing extracts markdown content"""
        response = "# Product Requirements\n\nThis is a test PRD..."
        parsed = llm_service.parse_prd_response(response)

        assert isinstance(parsed, PRDSchema)
        assert "Product Requirements" in parsed.content

    def test_parse_prd_response_handles_malformed_input(self, llm_service):
        """Test parsing handles malformed responses"""
        response = "Not valid markdown at all!"
        parsed = llm_service.parse_prd_response(response)

        # Should still create valid response
        assert parsed is not None
        assert len(parsed.content) > 0

    def test_parse_features_response(self, llm_service):
        """Test features parsing"""
        response = """
        # Features
        - User Authentication
        - Product Search
        - Shopping Cart
        """
        parsed = llm_service.parse_features_response(response)

        assert isinstance(parsed, FeaturesSchema)
        assert len(parsed.features) > 0

    # ==================== Concurrency Tests ====================

    @pytest.mark.asyncio
    async def test_concurrent_requests_handled_correctly(self, llm_service):
        """Test service handles concurrent requests"""
        import asyncio

        # Mock response
        with patch.object(llm_service, 'generate_prd') as mock_gen:
            mock_gen.return_value = "# PRD..."

            requests = [
                PRDRequest(
                    project_name=f"Project {i}",
                    project_description="Desc",
                    tech_stack="React"
                )
                for i in range(5)
            ]

            # Execute concurrently
            results = await asyncio.gather(*[
                asyncio.to_thread(llm_service.generate_prd, req)
                for req in requests
            ])

            assert len(results) == 5
            assert all(r == "# PRD..." for r in results)

    # ==================== Cache Tests ====================

    @patch('src.services.llm_service.GoogleGenerativeAI')
    def test_caching_prevents_duplicate_requests(self, mock_gemini, llm_service):
        """Test that identical requests use cache"""
        mock_response = MagicMock()
        mock_response.text = "# Cached PRD..."
        mock_gemini.return_value.generate_content.return_value = mock_response

        request = PRDRequest(
            project_name="Test",
            project_description="Test",
            tech_stack="React"
        )

        # First call
        result1 = llm_service.generate_prd(request)
        # Second call (should use cache)
        result2 = llm_service.generate_prd(request)

        assert result1 == result2
        # API should only be called once
        assert mock_gemini.return_value.generate_content.call_count == 1
