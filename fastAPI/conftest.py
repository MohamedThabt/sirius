"""
Pytest configuration for FastAPI tests
"""
import os
import sys
from pathlib import Path

# Add src directory to path
sys.path.insert(0, str(Path(__file__).parent / 'src'))

import pytest
from dotenv import load_dotenv

# Load test environment variables
load_dotenv('.env.test')


@pytest.fixture(scope='session')
def test_db():
    """Fixture for test database session"""
    from src.database import SessionLocal, Base, engine
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        # Cleanup
        Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session(test_db):
    """Fixture for individual test database session"""
    from src.database import SessionLocal
    
    connection = test_db.connection()
    transaction = connection.begin()
    session = SessionLocal(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db_session):
    """Fixture for FastAPI test client"""
    from fastapi.testclient import TestClient
    from src.main import app
    
    # Override get_db dependency
    from src.database import get_db
    
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()


@pytest.fixture
def mock_gemini_response():
    """Mock Gemini API response"""
    return {
        'candidates': [
            {
                'content': {
                    'parts': [
                        {
                            'text': '# Product Requirements Document\n\nThis is a mock PRD...'
                        }
                    ]
                }
            }
        ]
    }


def pytest_configure(config):
    """Pytest configuration hook"""
    config.addinivalue_line(
        'markers', 'integration: mark test as integration test'
    )
    config.addinivalue_line(
        'markers', 'unit: mark test as unit test'
    )
    config.addinivalue_line(
        'markers', 'asyncio: mark test as async'
    )
