# DevMind QA & Testing Reference Guide

## Quick Links

- **Main Strategy**: [QA_TESTING_STRATEGY.md](QA_TESTING_STRATEGY.md)
- **Quick Start**: [TESTING_QUICK_START.md](TESTING_QUICK_START.md)
- **GitHub Workflow**: [.github/workflows/test.yml](.github/workflows/test.yml)

---

## Technology Stack

| Layer | Tech | Framework | Purpose |
|-------|------|-----------|---------|
| **Frontend** | React 18 | Vitest + Testing Library | Unit & component testing |
| **Backend** | Laravel 12 | PHPUnit | API & business logic testing |
| **API Service** | FastAPI (Python) | Pytest | Service & integration testing |
| **E2E** | Web App | Playwright | Critical user journey testing |
| **CI/CD** | GitHub Actions | Workflows | Automated test execution |

---

## Test Pyramid Breakdown

### Unit Tests (60-70%)
**Focus**: Individual functions, components, helpers  
**Speed**: <100ms  
**Tools**: Vitest, PHPUnit, Pytest  
**Examples**:
- React component rendering
- PHP service methods
- Python utility functions
- Form validation
- Data transformation

### Integration Tests (20-30%)
**Focus**: Module interactions, API endpoints, database  
**Speed**: <500ms  
**Tools**: PHPUnit (Feature tests), Pytest (async tests)  
**Examples**:
- API endpoint with database
- Service → Database → Controller flow
- Authentication system
- Permission checks
- Data persistence

### E2E Tests (5-10%)
**Focus**: Complete user journeys  
**Speed**: <30s per test  
**Tools**: Playwright  
**Examples**:
- User signup → login → create project
- Generate PRD → edit → save
- Invite team member → accept → collaborate
- Error handling & recovery

---

## Running Tests by Scenario

### Before Committing Code
```bash
# Frontend
cd laravel && npm run test:unit && npm run lint

# Backend
cd laravel && php artisan test

# FastAPI
cd fastAPI && pytest tests/unit/

# All local tests
npm run test:all
```

### Before Creating Pull Request
```bash
# All tests must pass
npm run test:all
php artisan test --coverage  # Check coverage >80%
pytest --cov=src              # FastAPI coverage
npx playwright test            # E2E smoke test
```

### During Code Review
```bash
# Check coverage of changed files
git diff --name-only origin/main | grep -E '\.(tsx?|php|py)$' \
  | xargs npm run test:coverage

# Verify no flaky tests
npm run test:all -- --repeat=5  # Run tests multiple times
```

### Before Release
```bash
# Full test suite with everything
npm run test:all
php artisan test --coverage --min=80
pytest --cov=src
npx playwright test --headed

# Performance tests
npm run perf:test
```

---

## Coverage Requirements

### Minimum Standards
- **Unit Tests**: >85% (critical business logic)
- **Integration Tests**: >70% (API endpoints)
- **Overall**: >80% (codebase average)

### File-Specific Standards
```
laravel/app/Services/         >90%  (business logic)
laravel/app/Models/           >85%  (data models)
fastAPI/src/services/         >90%  (AI services)
laravel/resources/js/pages/   >70%  (UI pages)
laravel/resources/js/components/ >80% (reusable components)
```

### Exclusions
- Configuration files
- Migration files
- Seeder files
- Auto-generated code
- Third-party integrations (mocked)

---

## Common Testing Patterns

### Pattern 1: Testing with Fixtures/Factories

**Laravel (PHPUnit)**
```php
$user = User::factory()->create(['email' => 'test@example.com']);
$project = Project::factory()->for($user)->create();

// Test with this data
$this->actingAs($user)->get("/projects/{$project->id}");
```

**React (Vitest)**
```javascript
const mockProps = {
  onSubmit: vi.fn(),
  isLoading: false,
  error: null,
};
render(<ProjectForm {...mockProps} />);
```

**FastAPI (Pytest)**
```python
@pytest.fixture
def test_user():
    return User.create(email="test@example.com")

def test_with_user(test_user):
    assert test_user.email == "test@example.com"
```

---

### Pattern 2: Mocking External Services

**Gemini API Mock (FastAPI)**
```python
@patch('src.services.llm_service.GoogleGenerativeAI')
def test_generate_prd(mock_gemini, llm_service):
    mock_response = MagicMock()
    mock_response.text = "# PRD..."
    mock_gemini.return_value.generate_content.return_value = mock_response
    
    result = llm_service.generate_prd(request)
    assert "PRD" in result
```

**API Mock (Playwright)**
```typescript
await page.route('**/api/generate/**', route => {
    route.fulfill({
        status: 200,
        body: JSON.stringify({ content: "# Generated..." })
    });
});
```

---

### Pattern 3: Testing Error Cases

**PHP Error Handling**
```php
public function test_handles_missing_project()
{
    $response = $this->actingAs($user)
        ->get('/api/projects/99999');
    
    $response->assertStatus(404);
}
```

**Python Error Handling**
```python
def test_handles_timeout():
    with patch.object(service, 'call_api') as mock:
        mock.side_effect = TimeoutError()
        
        with pytest.raises(TimeoutError):
            service.generate_prd(request)
```

**React Error State**
```javascript
it('should show error message', () => {
    render(<ProjectForm error="Failed to create" />);
    expect(screen.getByText('Failed to create')).toBeInTheDocument();
});
```

---

## Flaky Test Resolution

### Identifying Flaky Tests
```bash
# Run test multiple times
for i in {1..10}; do
  npm run test:unit -- ProjectForm.test.tsx
done

# Check CI logs for intermittent failures
```

### Common Causes & Fixes

| Issue | Cause | Solution |
|-------|-------|----------|
| Timeout failures | Too short wait time | Increase timeout or use `waitFor` |
| Race conditions | Unordered async ops | Use proper async/await or queue |
| Time-dependent | Hardcoded dates | Use mocked date or relative time |
| Data order | Unordered results | Sort before assertion |
| Slow API | Rate limiting | Add retry logic or mock |

### Example: Fixing Flaky Async Test
```javascript
// ❌ BAD - No wait
test('should display data', () => {
    render(<Component />);
    expect(screen.getByText('Data')).toBeInTheDocument();
});

// ✅ GOOD - Wait for element
test('should display data', async () => {
    render(<Component />);
    await waitFor(() => {
        expect(screen.getByText('Data')).toBeInTheDocument();
    }, { timeout: 3000 });
});
```

---

## Monitoring & Metrics

### Key Metrics to Track

```
✓ Test Pass Rate          Target: >99%
✓ Code Coverage           Target: >80%
✓ Test Execution Time     Target: <10 min
✓ Flaky Test Rate         Target: <1%
✓ E2E Success Rate        Target: 100% on main
```

### Health Check Commands

```bash
# Coverage report
npm run test:unit:coverage
php artisan test --coverage
pytest --cov=src --cov-report=html

# Performance report
time npm run test:unit
time php artisan test
time pytest

# Recent failures
grep -r "FAILED" ci-logs/
```

---

## Setting Up Local Development

### Initial Setup

```bash
# Clone and install
git clone <repo>
cd sirius

# Frontend
cd laravel
npm install
npm run dev

# Backend
php artisan migrate
php artisan db:seed

# FastAPI (in separate terminal)
cd fastAPI
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn src.main:app --reload

# Run tests
npm run test:all
```

### Before Making Changes

```bash
# Create feature branch
git checkout -b feature/my-feature

# Run baseline tests
npm run test:unit:watch

# Make changes and keep tests passing
```

### After Making Changes

```bash
# Run all affected tests
npm run test:unit -- --changed
php artisan test --filter=MyNewFeature

# Update snapshots if needed
npm run test:unit -- -u

# Verify coverage increased or maintained
npm run test:unit:coverage
```

---

## Troubleshooting Guide

### "Tests are slow"
- [ ] Check if running parallel tests: `npm run test:unit -- --workers=4`
- [ ] Verify test database is local (not remote)
- [ ] Look for N+1 queries in Laravel tests
- [ ] Check if Playwright videos are being recorded unnecessarily

### "Tests are flaky"
- [ ] Increase timeout: `timeout: { timeout: 10000 }`
- [ ] Use `waitFor()` instead of immediate assertions
- [ ] Mock external APIs consistently
- [ ] Check for race conditions in async code
- [ ] Review CI environment (memory, CPU)

### "Coverage not updating"
- [ ] Clear coverage cache: `rm -rf coverage/`
- [ ] Ensure test files run: `npm run test:unit -- --reporter=verbose`
- [ ] Check `vitest.config.ts` includes correct paths
- [ ] Verify config excludes are not too broad

### "CI fails but local passes"
- [ ] Pull latest from main: `git pull origin main`
- [ ] Clear node_modules: `rm -rf node_modules && npm install`
- [ ] Check environment variables in `.env.testing`
- [ ] Verify PHP/Python versions match CI environment
- [ ] Run with `--verbose` flag for more info

---

## Test Maintenance Schedule

### Daily
- [ ] Review failed tests in CI
- [ ] Fix blockers immediately
- [ ] Update snapshots if expected

### Weekly
- [ ] Review test coverage trends
- [ ] Fix flaky tests
- [ ] Update test documentation

### Monthly
- [ ] Refactor duplicate test code
- [ ] Archive obsolete tests
- [ ] Review and optimize slow tests
- [ ] Update testing dependencies

### Quarterly
- [ ] Review and update testing strategy
- [ ] Analyze coverage gaps
- [ ] Plan new test infrastructure
- [ ] Training on best practices

---

## Team Guidelines

### Code Review Checklist

- [ ] All tests pass locally and in CI
- [ ] New code has >80% test coverage
- [ ] No flaky or skipped tests
- [ ] Test names are clear and descriptive
- [ ] Proper use of fixtures/mocks
- [ ] No hardcoded data in tests
- [ ] Tests follow project conventions

### Testing Standards

1. **Test Independence**: Each test runs independently
2. **Clear Names**: Test name explains what it tests
3. **AAA Pattern**: Arrange → Act → Assert
4. **Fast**: Unit tests <100ms, integration <500ms
5. **Deterministic**: Same result every run
6. **Focused**: Test one thing per test
7. **Isolated**: No dependencies between tests

---

## Additional Resources

### Learning Materials
- [Testing JavaScript](https://testingjavascript.com/) - Free course
- [Laravel Testing Masterclass](https://laraveltesting.com/) - By Adam Wathan
- [Pytest Best Practices](https://docs.pytest.org/en/latest/) - Official docs
- [Playwright Tutorial](https://playwright.dev/docs/intro) - Official docs

### Tools & Services
- [CodeCov](https://codecov.io/) - Coverage tracking
- [Sentry](https://sentry.io/) - Error tracking
- [BrowserStack](https://www.browserstack.com/) - Cross-browser testing
- [Datadog](https://www.datadoghq.com/) - Performance monitoring

### Team Communication
- **#testing** Slack channel for test discussions
- **Weekly sync**: Thursdays 10am - QA standup
- **Monthly retro**: Coverage goals and improvements

---

## FAQ

**Q: How do I add a test for a new feature?**
A: Add test file to appropriate directory, write test using example patterns above, run locally, commit with code.

**Q: What's a good test coverage target?**
A: >80% overall, >90% for critical business logic. Focus on important code, not just numbers.

**Q: How do I handle external API calls in tests?**
A: Always mock them using `@patch` (Python) or `vi.fn()` (JavaScript). Use fixtures for common responses.

**Q: Can I skip a test temporarily?**
A: Yes, use `test.skip()` in JavaScript or `@test` comment in PHP, but log issue in Jira and fix soon.

**Q: How do I debug a failing E2E test?**
A: Run with `--debug` flag, use `page.pause()` to stop execution, or check screenshot/video artifacts.

**Q: Should I test third-party libraries?**
A: No, mock them. You trust the library vendor, focus on testing your code that uses the library.

---

**Created**: December 24, 2025  
**Maintained by**: QA Team  
**Last Updated**: December 24, 2025
