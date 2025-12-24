# Comprehensive QA & Automated Testing Strategy for DevMind

**Project**: DevMind - AI-powered software requirements generation platform  
**Tech Stack**: Laravel 12 (PHP) + React/Inertia.js (Frontend) + FastAPI (Python AI Service) + PostgreSQL  
**Date Created**: December 24, 2025

---

## Table of Contents
1. [Project Overview & User Flows](#project-overview--user-flows)
2. [Testing Pyramid Strategy](#testing-pyramid-strategy)
3. [Unit Testing](#unit-testing)
4. [Integration Testing](#integration-testing)
5. [End-to-End (E2E) Testing](#end-to-end-e2e-testing)
6. [CI/CD Automation](#cicd-automation)
7. [Edge Cases](#edge-cases)
8. [Implementation Roadmap](#implementation-roadmap)

---

## Project Overview & User Flows

### Core User Flows

**Flow 1: Project Creation & Analysis**
1. User signs up/logs in
2. Creates a new project
3. Provides project context (name, description, tech stack)
4. Selects AI generation options (PRD, Features, Architecture, etc.)
5. Views generated documentation
6. Edits and refines outputs

**Flow 2: Team Collaboration**
1. Project owner invites team members
2. Team members accept invitation
3. Collaborate on modules and features
4. Version control of generated documents

**Flow 3: AI Generation Pipeline**
1. Request sent to FastAPI backend
2. FastAPI calls Gemini AI API
3. Response processed and stored in database
4. Frontend displays results
5. User can regenerate or edit outputs

---

## Testing Pyramid Strategy

```
                    /\
                   /  \
                  / E2E \
                 /Tests  \  ← 5-10% (5-10 slow tests)
                /----------\
               /            \
              / Integration  \ ← 20-30% (30-50 moderate speed)
             /   Tests        \
            /------------------\
           /                    \
          /  Unit Tests         \ ← 60-70% (500+ fast tests)
         /      (Base)           \
        /------------------------\
```

**Test Distribution Target:**
- **Unit Tests**: 60-70% of test suite (500+ tests)
- **Integration Tests**: 20-30% (30-50 tests)
- **E2E Tests**: 5-10% (5-10 critical path tests)

---

## Unit Testing

### Testing Framework Setup

#### Frontend (React/Inertia.js)
```bash
# Install dependencies
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom
```

#### Backend (Laravel)
```bash
# Already included in composer.json
php artisan test
```

#### FastAPI (Python)
```bash
# Install dependencies
pip install pytest pytest-cov pytest-asyncio httpx
```

---

### Unit Test Examples

#### 1. **Frontend: React Component Testing (Vitest)**

**File**: `resources/js/components/__tests__/ProjectForm.test.jsx`

```javascript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProjectForm from '../ProjectForm';

describe('ProjectForm Component', () => {
  const mockOnSubmit = vi.fn();

  it('should render form with all required fields', () => {
    render(<ProjectForm onSubmit={mockOnSubmit} />);
    
    expect(screen.getByLabelText(/project name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tech stack/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create project/i })).toBeInTheDocument();
  });

  it('should validate required fields before submission', async () => {
    render(<ProjectForm onSubmit={mockOnSubmit} />);
    
    const submitBtn = screen.getByRole('button', { name: /create project/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/project name is required/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should submit form with valid data', async () => {
    render(<ProjectForm onSubmit={mockOnSubmit} />);
    
    fireEvent.change(screen.getByLabelText(/project name/i), {
      target: { value: 'My Awesome App' }
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'A test project' }
    });
    fireEvent.change(screen.getByLabelText(/tech stack/i), {
      target: { value: 'Laravel + React' }
    });

    fireEvent.click(screen.getByRole('button', { name: /create project/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      name: 'My Awesome App',
      description: 'A test project',
      techStack: 'Laravel + React'
    });
  });

  it('should disable submit button while loading', () => {
    const { rerender } = render(
      <ProjectForm onSubmit={mockOnSubmit} isLoading={false} />
    );
    
    expect(screen.getByRole('button', { name: /create project/i })).not.toBeDisabled();

    rerender(<ProjectForm onSubmit={mockOnSubmit} isLoading={true} />);
    
    expect(screen.getByRole('button', { name: /create project/i })).toBeDisabled();
  });

  it('should display error message on submission failure', async () => {
    const { rerender } = render(
      <ProjectForm onSubmit={mockOnSubmit} error={null} />
    );
    
    rerender(
      <ProjectForm onSubmit={mockOnSubmit} error="Failed to create project" />
    );

    expect(screen.getByText('Failed to create project')).toBeInTheDocument();
  });
});
```

---

#### 2. **Backend: Laravel Unit Test**

**File**: `tests/Unit/Models/ProjectTest.php`

```php
<?php

namespace Tests\Unit\Models;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function a_project_must_have_valid_name_and_description()
    {
        $user = User::factory()->create();
        
        $project = Project::factory()
            ->for($user)
            ->create([
                'name' => 'E-Commerce Platform',
                'description' => 'A modern e-commerce solution',
            ]);

        $this->assertNotNull($project->name);
        $this->assertTrue(strlen($project->name) >= 3);
        $this->assertTrue(strlen($project->description) >= 10);
        $this->assertEquals($user->id, $project->user_id);
    }

    /** @test */
    public function project_slug_is_auto_generated_from_name()
    {
        $user = User::factory()->create();
        
        $project = Project::factory()
            ->for($user)
            ->create([
                'name' => 'My New Project',
                'slug' => null, // Should be auto-generated
            ]);

        $this->assertEquals('my-new-project', $project->slug);
    }

    /** @test */
    public function a_project_has_many_modules()
    {
        $user = User::factory()->create();
        $project = Project::factory()->for($user)->create();

        $project->modules()->createMany([
            ['name' => 'Authentication', 'description' => 'User login system'],
            ['name' => 'Payment', 'description' => 'Payment processing'],
        ]);

        $this->assertCount(2, $project->modules);
        $this->assertEquals('Authentication', $project->modules->first()->name);
    }

    /** @test */
    public function a_project_can_be_shared_with_team_members()
    {
        $owner = User::factory()->create();
        $teamMember = User::factory()->create();
        
        $project = Project::factory()->for($owner)->create();
        $project->users()->attach($teamMember);

        $this->assertTrue($project->users->contains($teamMember));
    }

    /** @test */
    public function project_status_defaults_to_draft()
    {
        $user = User::factory()->create();
        
        $project = Project::factory()
            ->for($user)
            ->create();

        $this->assertEquals('draft', $project->status);
    }

    /** @test */
    public function project_can_transition_to_active_status()
    {
        $user = User::factory()->create();
        $project = Project::factory()
            ->for($user)
            ->state(['status' => 'draft'])
            ->create();

        $project->markAsActive();

        $this->assertEquals('active', $project->refresh()->status);
    }
}
```

---

#### 3. **FastAPI Unit Test (Python)**

**File**: `fastAPI/tests/unit/test_llm_service.py`

```python
import pytest
from unittest.mock import patch, MagicMock
from src.services.llm_service import LLMService
from src.models.request_models import PRDRequest

class TestLLMService:
    """Test suite for LLM Service"""

    @pytest.fixture
    def llm_service(self):
        """Fixture to provide LLM service instance"""
        return LLMService()

    @pytest.fixture
    def mock_prd_request(self):
        """Fixture for mock PRD request"""
        return PRDRequest(
            project_name="E-Commerce Platform",
            project_description="A modern shopping platform",
            tech_stack="React, Node.js, PostgreSQL"
        )

    def test_llm_service_initialization(self, llm_service):
        """Test LLM service initializes correctly"""
        assert llm_service is not None
        assert hasattr(llm_service, 'generate_prd')

    @patch('src.services.llm_service.GoogleGenerativeAI')
    def test_generate_prd_success(self, mock_gemini, llm_service, mock_prd_request):
        """Test successful PRD generation"""
        mock_response = MagicMock()
        mock_response.text = "# Product Requirements Document\n..."
        mock_gemini.return_value.generate_content.return_value = mock_response

        result = llm_service.generate_prd(mock_prd_request)

        assert result is not None
        assert isinstance(result, str)
        assert "Product Requirements Document" in result

    @patch('src.services.llm_service.GoogleGenerativeAI')
    def test_generate_prd_handles_api_error(self, mock_gemini, llm_service, mock_prd_request):
        """Test PRD generation handles API errors gracefully"""
        mock_gemini.return_value.generate_content.side_effect = Exception("API Error")

        with pytest.raises(Exception):
            llm_service.generate_prd(mock_prd_request)

    def test_prd_request_validation(self):
        """Test PRD request validation"""
        # Missing required field
        with pytest.raises(ValueError):
            PRDRequest(
                project_name="",  # Empty name
                project_description="A test project",
                tech_stack="React"
            )

    def test_prd_request_max_length_validation(self):
        """Test PRD request field length limits"""
        with pytest.raises(ValueError):
            PRDRequest(
                project_name="A" * 1000,  # Exceeds max length
                project_description="Description",
                tech_stack="React"
            )

    def test_sanitize_user_input(self, llm_service):
        """Test input sanitization for security"""
        malicious_input = "<script>alert('xss')</script>test"
        sanitized = llm_service.sanitize_input(malicious_input)

        assert "<script>" not in sanitized
        assert "alert" not in sanitized
```

---

## Integration Testing

### 1. **Laravel API Integration Tests**

**File**: `tests/Feature/ProjectCreationTest.php`

```php
<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectCreationTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function a_user_can_create_a_project()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->post('/api/projects', [
                'name' => 'New Project',
                'description' => 'Project description',
                'tech_stack' => 'Laravel, React, PostgreSQL',
            ]);

        $response->assertStatus(201);
        $response->assertJsonStructure([
            'data' => [
                'id',
                'name',
                'slug',
                'description',
                'tech_stack',
                'status',
                'created_at',
            ]
        ]);

        $this->assertDatabaseHas('projects', [
            'name' => 'New Project',
            'user_id' => $user->id,
        ]);
    }

    /** @test */
    public function project_creation_requires_authentication()
    {
        $response = $this->post('/api/projects', [
            'name' => 'New Project',
            'description' => 'Description',
        ]);

        $response->assertStatus(401);
    }

    /** @test */
    public function a_user_can_fetch_their_projects()
    {
        $user = User::factory()->create();
        Project::factory(3)->for($user)->create();

        $response = $this->actingAs($user)
            ->get('/api/projects');

        $response->assertStatus(200);
        $response->assertJsonCount(3, 'data');
    }

    /** @test */
    public function a_user_can_update_their_project()
    {
        $user = User::factory()->create();
        $project = Project::factory()->for($user)->create();

        $response = $this->actingAs($user)
            ->put("/api/projects/{$project->id}", [
                'name' => 'Updated Project Name',
                'description' => 'Updated description',
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('projects', [
            'id' => $project->id,
            'name' => 'Updated Project Name',
        ]);
    }

    /** @test */
    public function a_user_cannot_update_another_users_project()
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $project = Project::factory()->for($owner)->create();

        $response = $this->actingAs($otherUser)
            ->put("/api/projects/{$project->id}", [
                'name' => 'Hacked Name',
            ]);

        $response->assertStatus(403);
        $this->assertDatabaseHas('projects', [
            'id' => $project->id,
            'name' => $project->name, // Original unchanged
        ]);
    }

    /** @test */
    public function a_user_can_delete_their_project()
    {
        $user = User::factory()->create();
        $project = Project::factory()->for($user)->create();

        $response = $this->actingAs($user)
            ->delete("/api/projects/{$project->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('projects', [
            'id' => $project->id,
        ]);
    }
}
```

---

### 2. **FastAPI to Database Integration Test**

**File**: `fastAPI/tests/integration/test_project_service_integration.py`

```python
import pytest
import asyncio
from sqlalchemy.orm import Session
from src.services.project_service import ProjectService
from src.models.database_models import Project, User
from src.models.request_models import ProjectCreateRequest

class TestProjectServiceIntegration:
    """Integration tests for Project Service with Database"""

    @pytest.fixture
    def db_session(self):
        """Fixture providing database session"""
        # Setup test database
        from tests.conftest import test_db
        yield test_db()

    @pytest.fixture
    def project_service(self, db_session):
        """Fixture providing project service"""
        return ProjectService(db=db_session)

    def test_create_project_saves_to_database(self, project_service, db_session):
        """Test creating a project saves to database"""
        request = ProjectCreateRequest(
            name="Test Project",
            description="Test Description",
            tech_stack="React, Node.js"
        )

        project = project_service.create_project(request, user_id=1)

        # Verify in database
        db_project = db_session.query(Project).filter(
            Project.id == project.id
        ).first()

        assert db_project is not None
        assert db_project.name == "Test Project"
        assert db_project.user_id == 1

    def test_fetch_user_projects_returns_only_user_projects(self, project_service, db_session):
        """Test fetching projects returns only user's projects"""
        # Create projects for different users
        user1_projects = project_service.create_project(
            ProjectCreateRequest(
                name="User 1 Project",
                description="User 1 Desc",
                tech_stack="React"
            ),
            user_id=1
        )

        user2_projects = project_service.create_project(
            ProjectCreateRequest(
                name="User 2 Project",
                description="User 2 Desc",
                tech_stack="Vue"
            ),
            user_id=2
        )

        # Fetch user 1 projects
        user1_fetched = project_service.get_user_projects(user_id=1)

        assert len(user1_fetched) == 1
        assert user1_fetched[0].name == "User 1 Project"

    def test_project_deletion_cascade(self, project_service, db_session):
        """Test deleting project deletes related modules and features"""
        # Create project with modules
        project = project_service.create_project(
            ProjectCreateRequest(
                name="Cascade Test",
                description="Test cascade",
                tech_stack="React"
            ),
            user_id=1
        )

        # Add modules
        module = project_service.add_module(
            project_id=project.id,
            name="Auth Module",
            description="Authentication"
        )

        # Delete project
        project_service.delete_project(project.id)

        # Verify project and modules are deleted
        db_project = db_session.query(Project).filter(
            Project.id == project.id
        ).first()
        
        assert db_project is None

    @pytest.mark.asyncio
    async def test_concurrent_project_creation(self, project_service):
        """Test concurrent project creation doesn't cause conflicts"""
        async def create_project(name):
            return project_service.create_project(
                ProjectCreateRequest(
                    name=name,
                    description="Concurrent test",
                    tech_stack="React"
                ),
                user_id=1
            )

        projects = await asyncio.gather(*[
            create_project(f"Project {i}") for i in range(10)
        ])

        assert len(projects) == 10
        assert len(set(p.id for p in projects)) == 10  # All unique IDs
```

---

## End-to-End (E2E) Testing

### E2E Test Setup (Playwright)

**File**: `tests/e2e/playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:8000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],

  webServer: {
    command: 'php artisan serve',
    url: 'http://localhost:8000',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

### E2E Test Examples

#### **Happy Path: Project Creation and PRD Generation**

**File**: `tests/e2e/project-creation.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Project Creation & PRD Generation (Happy Path)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login
    await page.goto('/login');
  });

  test('should complete full project creation and PRD generation flow', async ({ page }) => {
    // Step 1: Login
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button:has-text("Sign In")');

    // Wait for navigation to dashboard
    await page.waitForURL('/dashboard');
    expect(page.url()).toContain('/dashboard');

    // Step 2: Navigate to create project
    await page.click('button:has-text("New Project")');
    await page.waitForURL('/projects/create');

    // Step 3: Fill project form
    await page.fill('input[placeholder="Project Name"]', 'E-Commerce Platform');
    await page.fill('textarea[placeholder="Project Description"]', 
      'A modern e-commerce platform for selling digital products');
    
    await page.click('select[name="tech_stack"]');
    await page.click('option:has-text("React + Laravel + PostgreSQL")');

    // Step 4: Submit form
    await page.click('button:has-text("Create Project")');

    // Wait for project detail page
    await page.waitForURL('/projects/**');
    expect(page.url()).toMatch(/\/projects\/\d+/);

    // Step 5: Verify project was created
    expect(await page.locator('h1:has-text("E-Commerce Platform")').isVisible()).toBeTruthy();

    // Step 6: Request PRD generation
    await page.click('button:has-text("Generate PRD")');
    
    // Wait for loading to complete
    await page.waitForSelector('[data-testid="prd-generated"]', { timeout: 30000 });

    // Step 7: Verify PRD is displayed
    const prdContent = await page.locator('[data-testid="prd-content"]');
    expect(await prdContent.isVisible()).toBeTruthy();
    
    const prdText = await prdContent.textContent();
    expect(prdText).toContain('Product Requirements');

    // Step 8: Verify user can edit PRD
    await page.click('button:has-text("Edit PRD")');
    await page.fill('.prd-editor', 'Updated PRD content');
    await page.click('button:has-text("Save Changes")');

    // Verify changes are saved
    await page.waitForSelector('[data-testid="save-success"]');
    expect(await page.locator('[data-testid="save-success"]').isVisible()).toBeTruthy();
  });

  test('should allow user to generate multiple artifacts', async ({ page }) => {
    // Login
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button:has-text("Sign In")');
    await page.waitForURL('/dashboard');

    // Navigate to existing project
    await page.click('a:has-text("My First Project")');

    // Generate PRD
    await page.click('button:has-text("Generate PRD")');
    await page.waitForSelector('[data-testid="prd-generated"]', { timeout: 30000 });

    // Generate Features
    await page.click('button:has-text("Generate Features")');
    await page.waitForSelector('[data-testid="features-generated"]', { timeout: 30000 });

    // Generate Architecture (C4 Diagram)
    await page.click('button:has-text("Generate Architecture")');
    await page.waitForSelector('[data-testid="c4-generated"]', { timeout: 30000 });

    // Verify all artifacts are displayed
    expect(await page.locator('[data-testid="prd-content"]').isVisible()).toBeTruthy();
    expect(await page.locator('[data-testid="features-content"]').isVisible()).toBeTruthy();
    expect(await page.locator('[data-testid="c4-content"]').isVisible()).toBeTruthy();
  });
});
```

---

#### **Error Handling Path: Network Failure Recovery**

**File**: `tests/e2e/error-handling.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Error Handling & Recovery', () => {
  test('should handle API timeout gracefully', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button:has-text("Sign In")');
    await page.waitForURL('/dashboard');

    // Navigate to project
    await page.click('a:has-text("My Project")');

    // Mock API delay
    await page.route('**/api/generate/prd', route => {
      setTimeout(() => {
        route.abort();
      }, 45000); // Timeout after 45 seconds
    });

    // Attempt PRD generation
    await page.click('button:has-text("Generate PRD")');

    // Wait for timeout error message
    await page.waitForSelector('[data-testid="error-message"]', { timeout: 50000 });
    
    const errorMsg = await page.locator('[data-testid="error-message"]').textContent();
    expect(errorMsg).toContain('Request timed out');

    // Verify retry button is available
    expect(await page.locator('button:has-text("Retry")').isVisible()).toBeTruthy();

    // Click retry
    await page.click('button:has-text("Retry")');
    
    // Reset route to succeed
    await page.route('**/api/generate/prd', route => {
      route.continue();
    });

    // Wait for success
    await page.waitForSelector('[data-testid="prd-generated"]', { timeout: 30000 });
  });

  test('should validate form submission errors', async ({ page }) => {
    await page.goto('/projects/create');

    // Attempt to submit empty form
    await page.click('button:has-text("Create Project")');

    // Verify validation errors are shown
    expect(await page.locator('text=Project name is required').isVisible()).toBeTruthy();
    expect(await page.locator('text=Description is required').isVisible()).toBeTruthy();
    expect(await page.locator('text=Tech stack is required').isVisible()).toBeTruthy();
  });

  test('should handle unauthorized access', async ({ page }) => {
    // Try to access another user's project without permission
    await page.goto('/projects/999');

    // Should redirect to unauthorized page or login
    await page.waitForURL('/unauthorized|/login');
    
    expect(
      page.url().includes('/unauthorized') || page.url().includes('/login')
    ).toBeTruthy();
  });

  test('should handle invalid file uploads', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button:has-text("Sign In")');
    await page.waitForURL('/dashboard');

    await page.click('a:has-text("My Project")');
    await page.click('button:has-text("Import Requirements")');

    // Try to upload invalid file
    const fileInput = await page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'invalid.exe',
      mimeType: 'application/x-msdownload',
      buffer: Buffer.from('invalid'),
    });

    await page.click('button:has-text("Upload")');

    // Verify error message
    expect(await page.locator('text=Invalid file type').isVisible()).toBeTruthy();
  });
});
```

---

## CI/CD Automation

### GitHub Actions Configuration

**File**: `.github/workflows/test.yml`

```yaml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: devmind_test
          POSTGRES_PASSWORD: secret
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
          extensions: pdo, pdo_pgsql

      - name: Install Laravel dependencies
        run: |
          cd laravel
          composer install

      - name: Run Laravel unit tests
        run: |
          cd laravel
          php artisan test --parallel

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install frontend dependencies
        run: |
          cd laravel
          npm install

      - name: Run frontend unit tests
        run: |
          cd laravel
          npm run test:unit

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install FastAPI dependencies
        run: |
          cd fastAPI
          pip install -r requirements.txt
          pip install pytest pytest-cov

      - name: Run FastAPI unit tests
        run: |
          cd fastAPI
          pytest tests/unit/ --cov=src --cov-report=xml

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          files: ./fastAPI/coverage.xml
          flags: unittests
          name: codecov-umbrella

  integration-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: devmind_test
          POSTGRES_PASSWORD: secret
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
          extensions: pdo, pdo_pgsql

      - name: Install Laravel dependencies
        run: |
          cd laravel
          composer install

      - name: Setup database
        run: |
          cd laravel
          cp .env.example .env.testing
          php artisan key:generate --env=testing
          php artisan migrate --env=testing

      - name: Run Laravel integration tests
        run: |
          cd laravel
          php artisan test tests/Feature/ --env=testing

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install FastAPI dependencies
        run: |
          cd fastAPI
          pip install -r requirements.txt
          pip install pytest pytest-asyncio

      - name: Run FastAPI integration tests
        run: |
          cd fastAPI
          pytest tests/integration/ -v

  e2e-tests:
    runs-on: ubuntu-latest
    needs: integration-tests
    
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: devmind
          POSTGRES_PASSWORD: secret
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
          extensions: pdo, pdo_pgsql

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          cd laravel
          composer install
          npm install

      - name: Setup database
        run: |
          cd laravel
          php artisan key:generate
          php artisan migrate
          php artisan db:seed

      - name: Start Laravel server
        run: |
          cd laravel
          php artisan serve &

      - name: Wait for server
        run: sleep 5

      - name: Install Playwright
        run: |
          cd laravel
          npx playwright install

      - name: Run E2E tests
        run: |
          cd laravel
          npm run test:e2e

      - name: Upload Playwright report
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: laravel/playwright-report/

  code-quality:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'

      - name: Install Laravel dependencies
        run: |
          cd laravel
          composer install

      - name: Run PHPStan
        run: |
          cd laravel
          composer run phpstan

      - name: Run Pint (PHP Code Style)
        run: |
          cd laravel
          php artisan pint --test

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install frontend dependencies
        run: |
          cd laravel
          npm install

      - name: Run ESLint
        run: |
          cd laravel
          npm run lint

      - name: Check TypeScript
        run: |
          cd laravel
          npm run types

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install Python dependencies
        run: |
          cd fastAPI
          pip install -r requirements.txt
          pip install pylint flake8

      - name: Run Python linting
        run: |
          cd fastAPI
          flake8 src/ --max-line-length=100
```

---

## Edge Cases

### **5 Critical Edge Cases for DevMind**

#### **1. Concurrent AI Generation Requests**
**Scenario**: User clicks "Generate PRD" button multiple times rapidly, or multiple team members generate artifacts simultaneously.

**Test Implementation** (Integration):
```php
/** @test */
public function concurrent_generation_requests_queue_properly()
{
    $user = User::factory()->create();
    $project = Project::factory()->for($user)->create();

    // Simulate rapid clicks
    $job1 = GeneratePRD::dispatch($project, $user);
    $job2 = GeneratePRD::dispatch($project, $user);
    $job3 = GeneratePRD::dispatch($project, $user);

    // Only first request should be processed immediately
    Queue::assertPushed(GeneratePRD::class, 3);
    
    // Verify only one is processing
    $processing = ProjectGenerationLock::where('project_id', $project->id)
        ->where('status', 'processing')
        ->count();
    
    $this->assertEquals(1, $processing);
}
```

**Risk Impact**: Memory overflow, database locks, API quota exhaustion, duplicate generations.

---

#### **2. API Quota Exhaustion (Gemini AI Limits)**
**Scenario**: User/team hits Google Gemini API rate limits during generation.

**Test Implementation** (E2E):
```typescript
test('should handle API quota exceeded gracefully', async ({ page }) => {
    // Setup mock to simulate quota error
    await page.route('**/api/generate/**', route => {
        route.abort('failed', {
            errorCode: 429, // Rate Limited
            errorMessage: 'API quota exceeded',
        });
    });

    await page.click('button:has-text("Generate Features")');
    
    // User should see friendly error
    await page.waitForSelector('[data-testid="quota-error"]');
    const error = await page.locator('[data-testid="quota-error"]').textContent();
    
    expect(error).toContain('Generation limit reached');
    expect(error).toContain('Please try again in 1 hour');
    
    // Should provide fallback options
    expect(await page.locator('button:has-text("Use cached version")').isVisible()).toBeTruthy();
});
```

**Risk Impact**: User frustration, incomplete projects, loss of productivity.

---

#### **3. Large Project Context (Token Limit)**
**Scenario**: User has a very complex project with lots of existing modules/features that exceed AI token limits.

**Test Implementation** (Unit):
```python
def test_truncate_context_when_exceeds_token_limit():
    """Test context truncation for large projects"""
    service = ProjectService()
    
    # Create large project with many modules
    large_context = "Module: " + "x" * 100000  # ~100K tokens
    
    truncated = service.truncate_context_to_token_limit(
        large_context,
        max_tokens=4000
    )
    
    # Should preserve most important parts
    assert len(truncated) < len(large_context)
    assert estimate_tokens(truncated) <= 4000
    assert "Module:" in truncated  # Should keep key parts
```

**Risk Impact**: API failures, incomplete generations, lost data.

---

#### **4. Network Failure During Long Generation**
**Scenario**: User's connection drops midway through a 10-minute PRD generation.

**Test Implementation** (E2E):
```typescript
test('should resume generation after network interruption', async ({ page }) => {
    await page.goto('/projects/1');
    await page.click('button:has-text("Generate PRD")');
    
    // Simulate network failure after 5 seconds
    await page.waitForTimeout(5000);
    await page.context().setOffline(true);
    
    // UI should show retry option
    await page.waitForSelector('[data-testid="connection-lost"]', { timeout: 10000 });
    
    // Come back online
    await page.context().setOffline(false);
    
    // Retry should resume from checkpoint
    await page.click('button:has-text("Resume Generation")');
    
    // Should complete
    await page.waitForSelector('[data-testid="prd-generated"]', { timeout: 30000 });
});
```

**Risk Impact**: Lost work, frustrated users, incomplete data in database.

---

#### **5. Permission/Authorization Race Condition**
**Scenario**: Team member's access is revoked while they're editing a shared project, or they try to access a deleted project.

**Test Implementation** (Integration):
```php
/** @test */
public function user_cannot_edit_project_after_access_revoked()
{
    $owner = User::factory()->create();
    $collaborator = User::factory()->create();
    $project = Project::factory()->for($owner)->create();

    // Grant access
    $project->users()->attach($collaborator);
    $this->assertTrue($project->users->contains($collaborator));

    // Make edit request
    $editPromise = $this->actingAs($collaborator)
        ->put("/api/projects/{$project->id}", [
            'name' => 'New Name'
        ]);

    // Revoke access mid-request (in another process)
    $project->users()->detach($collaborator);

    // Edit should fail
    $editPromise->assertStatus(403);
}

/** @test */
public function deleted_project_returns_404_not_500()
{
    $user = User::factory()->create();
    $project = Project::factory()->for($user)->create();
    $projectId = $project->id;

    // Delete project
    $project->delete();

    // Access deleted project
    $response = $this->actingAs($user)
        ->get("/api/projects/{$projectId}");

    // Should return 404, not 500
    $response->assertStatus(404);
}
```

**Risk Impact**: Data corruption, unauthorized edits, security vulnerabilities, user confusion.

---

## Implementation Roadmap

### **Phase 1: Foundation (Week 1-2)**
- [ ] Set up testing frameworks (Vitest, PHPUnit, Pytest)
- [ ] Create test directory structure
- [ ] Write 50 unit tests (backend logic)
- [ ] Configure CI/CD pipeline skeleton

### **Phase 2: Coverage Expansion (Week 3-4)**
- [ ] Write 30 integration tests (API endpoints)
- [ ] Add 50+ frontend unit tests (React components)
- [ ] Integrate tests into GitHub Actions
- [ ] Set up code coverage tracking (CodeCov)

### **Phase 3: E2E & Polish (Week 5-6)**
- [ ] Install and configure Playwright
- [ ] Write 5-10 critical path E2E tests
- [ ] Implement error handling paths
- [ ] Add performance benchmarks

### **Phase 4: Optimization (Week 7+)**
- [ ] Parallelize test execution
- [ ] Create test fixtures/factories
- [ ] Document testing guidelines
- [ ] Establish test maintenance schedule

---

## Testing Checklist

### Before Every Pull Request:
- [ ] All unit tests pass locally
- [ ] Frontend components render correctly
- [ ] API endpoints return correct status codes
- [ ] No console errors or warnings
- [ ] New code has test coverage > 80%

### Before Every Release:
- [ ] All tests pass in CI/CD
- [ ] E2E tests cover critical paths
- [ ] Edge cases are tested
- [ ] Performance benchmarks are acceptable
- [ ] Security tests are passing

---

## Quick Start Commands

```bash
# Frontend (React) Unit Tests
cd laravel
npm install --save-dev vitest @testing-library/react
npm test:unit

# Backend (Laravel) Tests
cd laravel
php artisan test

# FastAPI Tests
cd fastAPI
pip install pytest pytest-cov
pytest tests/

# E2E Tests
cd laravel
npm install -D @playwright/test
npx playwright test

# Run all tests
npm run test:all
```

---

## Resources & References

- [Jest Documentation](https://jestjs.io/)
- [Vitest Documentation](https://vitest.dev/)
- [Laravel Testing Documentation](https://laravel.com/docs/12.x/testing)
- [Pytest Documentation](https://docs.pytest.org/)
- [Playwright Documentation](https://playwright.dev/)
- [GitHub Actions CI/CD](https://github.com/features/actions)

---

**Document Version**: 1.0  
**Last Updated**: December 24, 2025  
**Maintained By**: QA Team
