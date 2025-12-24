# Quick Start Guide for QA Testing Implementation

## Installation & Setup

### 1. **Frontend Testing (Vitest + Testing Library)**

```bash
cd laravel

# Install dependencies
npm install --save-dev vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom

# Run unit tests
npm run test:unit

# Run tests in watch mode
npm run test:unit -- --watch

# Run tests with coverage
npm run test:unit -- --coverage
```

Add to `package.json`:
```json
{
  "scripts": {
    "test:unit": "vitest run",
    "test:unit:watch": "vitest",
    "test:unit:coverage": "vitest run --coverage"
  }
}
```

---

### 2. **Backend Testing (PHPUnit)**

```bash
cd laravel

# Run all tests
php artisan test

# Run specific test file
php artisan test tests/Feature/Projects/ProjectApiTest.php

# Run with coverage
php artisan test --coverage

# Run in parallel
php artisan test --parallel

# Run with specific filter
php artisan test --filter=test_user_can_create_a_project
```

---

### 3. **FastAPI Testing (Pytest)**

```bash
cd fastAPI

# Install test dependencies
pip install pytest pytest-asyncio pytest-cov httpx

# Run all tests
pytest

# Run specific test file
pytest tests/unit/test_llm_service.py

# Run with coverage
pytest --cov=src --cov-report=html

# Run specific test
pytest tests/unit/test_llm_service.py::TestLLMService::test_generate_prd_success

# Run with verbose output
pytest -v

# Run only unit tests
pytest tests/unit/ -m unit
```

---

### 4. **E2E Testing (Playwright)**

```bash
cd laravel

# Install Playwright browsers
npx playwright install

# Run all E2E tests
npx playwright test

# Run specific test file
npx playwright test tests/e2e/devmind.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Run in debug mode
npx playwright test --debug

# Open HTML report
npx playwright show-report
```

Add to `package.json`:
```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report"
  }
}
```

---

## File Structure for Tests

```
sirius/
├── laravel/
│   ├── resources/js/components/__tests__/
│   │   ├── ProjectForm.test.tsx
│   │   ├── Dashboard.test.tsx
│   │   └── ...
│   ├── tests/
│   │   ├── Feature/
│   │   │   ├── Projects/
│   │   │   │   └── ProjectApiTest.php
│   │   │   └── ...
│   │   ├── Unit/
│   │   │   └── ...
│   │   ├── TestCase.php
│   │   └── setup.ts (for Vitest)
│   └── playwright.config.ts
│
├── fastAPI/
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── test_llm_service.py
│   │   │   └── ...
│   │   ├── integration/
│   │   │   └── ...
│   │   └── conftest.py
│   ├── pytest.ini
│   └── pyproject.toml
│
└── tests/
    └── e2e/
        ├── devmind.spec.ts
        └── playwright.config.ts
```

---

## Running Tests in CI/CD

### GitHub Actions Workflow

The `.github/workflows/test.yml` file is already configured to:

1. **Unit Tests** - Run on every commit
   - Frontend: Vitest
   - Backend: PHPUnit
   - FastAPI: Pytest

2. **Integration Tests** - Run after unit tests pass
   - API endpoints
   - Database interactions
   - Service integrations

3. **E2E Tests** - Run after integration tests pass
   - Critical user journeys
   - End-to-end flows

4. **Code Quality** - Run in parallel
   - Linting (ESLint, Pylint)
   - Code style (Prettier, Pint)
   - Type checking (TypeScript, PHPStan)

### Manual CI Trigger

Push to `develop` or `main` to trigger all tests:

```bash
git push origin feature/my-feature
# Tests run automatically on PR
```

---

## Test Writing Checklist

### Before Writing a Test

- [ ] Identify what you're testing (unit/integration/e2e)
- [ ] Determine expected input and output
- [ ] Plan edge cases and error scenarios
- [ ] Choose appropriate assertion methods

### While Writing Tests

- [ ] Use descriptive test names
- [ ] Follow AAA pattern: Arrange → Act → Assert
- [ ] Keep tests small and focused
- [ ] Use fixtures/factories for test data
- [ ] Mock external dependencies

### After Writing Tests

- [ ] Run tests locally to ensure they pass
- [ ] Check code coverage (aim for >80%)
- [ ] Verify tests are isolated (no dependencies)
- [ ] Test the test (verify it fails when code breaks)

---

## Test Naming Conventions

### Frontend (React/Vitest)

```javascript
// GOOD
test('should render form with all required fields', () => {})
test('should validate email format', () => {})
test('should disable submit button while loading', () => {})

// AVOID
test('form renders', () => {})
test('validates', () => {})
```

### Backend (Laravel/PHPUnit)

```php
// GOOD
public function test_user_can_create_a_project(): void {}
public function test_user_cannot_update_other_users_project(): void {}
public function test_project_creation_requires_authentication(): void {}

// AVOID
public function test_create(): void {}
public function test_update(): void {}
```

### FastAPI (Pytest)

```python
# GOOD
def test_llm_service_initializes_correctly():
def test_generate_prd_handles_api_error():
def test_sanitize_removes_malicious_input():

# AVOID
def test_init():
def test_generate():
def test_sanitize():
```

### E2E (Playwright)

```typescript
// GOOD
test('should complete full flow: signup → create project → generate PRD', async () => {})
test('should handle API timeout gracefully', async () => {})
test('should prevent unauthorized access', async () => {})

// AVOID
test('signup works', async () => {})
test('error handling', async () => {})
```

---

## Debugging Tests

### Frontend
```bash
# Run with UI
npm run test:unit:watch

# Debug specific test
npm run test:unit -- --reporter=verbose ProjectForm.test.tsx
```

### Backend
```bash
# Run with output
php artisan test --verbose

# Stop at first failure
php artisan test --stop-on-failure
```

### FastAPI
```bash
# Verbose output
pytest -v -s

# Drop into debugger on failure
pytest -s --pdb

# Show print statements
pytest -s
```

### E2E
```bash
# Debug mode opens interactive debugger
npx playwright test --debug

# Headed mode shows browser
npx playwright test --headed

# Slow down execution (ms)
npx playwright test --headed --max-failures 1 --headed
```

---

## Coverage Targets

| Level | Target | Description |
|-------|--------|-------------|
| Unit Tests | >85% | Core business logic, utilities |
| Integration Tests | >70% | API endpoints, database |
| E2E Tests | Critical paths only | 5-10 key user flows |
| **Overall** | **>80%** | All code combined |

---

## Performance Benchmarks

| Test Type | Target | Notes |
|-----------|--------|-------|
| Unit | <100ms each | Should be instant |
| Integration | <500ms each | Database ops slower |
| E2E | <30s per test | Browser interactions slow |
| Full Suite | <10 minutes | All tests together |

---

## Continuous Improvement

- Review test failures daily
- Update tests when requirements change
- Refactor test code like production code
- Archive outdated/flaky tests
- Celebrate high coverage milestones

---

## Resources

- [Vitest Docs](https://vitest.dev/)
- [Testing Library Docs](https://testing-library.com/)
- [Laravel Testing Docs](https://laravel.com/docs/12.x/testing)
- [Pytest Docs](https://docs.pytest.org/)
- [Playwright Docs](https://playwright.dev/)

---

**Last Updated**: December 24, 2025  
**Version**: 1.0
