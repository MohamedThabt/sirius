import { test, expect } from '@playwright/test';

/**
 * End-to-End Tests for DevMind
 * Tests critical user journeys through the entire application
 */

test.describe('Project Creation & AI Generation (Happy Path)', () => {
  test.beforeEach(async ({ page }) => {
    // Reset auth state
    await page.context().clearCookies();
    await page.goto('/');
  });

  test('should complete full flow: signup → create project → generate PRD', async ({ page }) => {
    // Step 1: Navigate to signup
    await page.click('a:has-text("Sign Up")');
    await page.waitForURL('/register');

    // Step 2: Register new account
    const email = `test-${Date.now()}@example.com`;
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'SecurePassword123!');
    await page.fill('input[name="password_confirmation"]', 'SecurePassword123!');
    await page.click('button:has-text("Create Account")');

    // Step 3: Wait for dashboard
    await page.waitForURL('/dashboard');
    expect(page.url()).toContain('/dashboard');

    // Step 4: Verify user is logged in
    await expect(page.locator('text=Test User')).toBeVisible();

    // Step 5: Create new project
    await page.click('button:has-text("New Project")');
    await page.waitForURL('/projects/create');

    // Step 6: Fill project form
    await page.fill('input[placeholder="Project Name"]', 'AI Chat Application');
    await page.fill(
      'textarea[placeholder="Project Description"]',
      'A real-time chat application with AI-powered features'
    );

    // Select tech stack
    const techStackSelect = page.locator('select[name="tech_stack"]').or(page.locator('[role="combobox"]'));
    await techStackSelect.click();
    await page.click('text=React + Node.js + MongoDB');

    // Step 7: Submit form
    await page.click('button:has-text("Create Project")');

    // Step 8: Wait for project detail page
    await page.waitForURL('/projects/**');
    const projectUrl = page.url();
    expect(projectUrl).toMatch(/\/projects\/\d+/);

    // Step 9: Verify project was created
    await expect(page.locator('h1:has-text("AI Chat Application")')).toBeVisible();

    // Step 10: Request PRD generation
    await page.click('button:has-text("Generate PRD")');

    // Step 11: Wait for generation to complete (with timeout for AI processing)
    await page.waitForSelector('[data-testid="prd-content"]', { timeout: 60000 });

    // Step 12: Verify PRD is displayed
    const prdContent = page.locator('[data-testid="prd-content"]');
    await expect(prdContent).toBeVisible();

    const prdText = await prdContent.textContent();
    expect(prdText).toContain('Product Requirements');
    expect(prdText).toContain('AI Chat');

    // Step 13: Test editing PRD
    await page.click('button:has-text("Edit PRD")');
    await page.fill('[data-testid="prd-editor"]', '# Updated PRD\n\nEdited content...');
    await page.click('button:has-text("Save")');

    // Step 14: Verify save success
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();

    // Step 15: Generate additional artifacts
    await page.click('button:has-text("Generate Features")');
    await page.waitForSelector('[data-testid="features-list"]', { timeout: 60000 });

    // Step 16: Verify features are displayed
    const featuresList = page.locator('[data-testid="features-list"]');
    await expect(featuresList).toBeVisible();
  });

  test('should allow team collaboration', async ({ page, context }) => {
    // Login as owner
    await page.goto('/login');
    await page.fill('input[name="email"]', 'owner@example.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button:has-text("Sign In")');
    await page.waitForURL('/dashboard');

    // Navigate to project
    await page.click('a:has-text("Team Project")');

    // Open sharing modal
    await page.click('button[aria-label="Share Project"]');

    // Invite team member
    const inviteEmail = `team-member-${Date.now()}@example.com`;
    await page.fill('input[placeholder="Enter email address"]', inviteEmail);
    await page.click('button:has-text("Send Invite")');

    // Verify invitation sent
    await expect(page.locator(`text=${inviteEmail}`)).toBeVisible();

    // Create new browser context for team member
    const teamContext = await context.browser()?.newContext();
    const teamPage = await teamContext?.newPage();

    // Team member signs up
    await teamPage?.goto('/register');
    await teamPage?.fill('input[name="email"]', inviteEmail);
    await teamPage?.fill('input[name="password"]', 'Password123!');
    await teamPage?.fill('input[name="password_confirmation"]', 'Password123!');
    await teamPage?.click('button:has-text("Create Account")');

    // Team member accepts invitation
    await teamPage?.waitForURL('/invitations');
    await teamPage?.click('button:has-text("Accept")');

    // Verify team member now has access to project
    await expect(teamPage?.locator('h1:has-text("Team Project")')).toBeVisible();

    await teamContext?.close();
  });
});

test.describe('Error Handling & Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button:has-text("Sign In")');
    await page.waitForURL('/dashboard');
  });

  test('should handle API timeout gracefully', async ({ page }) => {
    await page.goto('/projects/1');

    // Mock slow API response
    await page.route('**/api/generate/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 45000));
      await route.abort();
    });

    await page.click('button:has-text("Generate PRD")');

    // Wait for error message
    await page.waitForSelector('[role="alert"]', { timeout: 50000 });
    await expect(page.locator('[role="alert"]')).toContainText('Request timed out');

    // Verify retry button exists
    await expect(page.locator('button:has-text("Retry")')).toBeVisible();
  });

  test('should validate form inputs', async ({ page }) => {
    await page.click('button:has-text("New Project")');
    await page.waitForURL('/projects/create');

    // Try to submit empty form
    await page.click('button:has-text("Create Project")');

    // Verify validation errors
    await expect(page.locator('text=Project name is required')).toBeVisible();
    await expect(page.locator('text=Description is required')).toBeVisible();

    // Fill name too short
    await page.fill('input[placeholder="Project Name"]', 'AB');
    await page.click('button:has-text("Create Project")');

    await expect(page.locator('text=Minimum 3 characters')).toBeVisible();
  });

  test('should prevent unauthorized access', async ({ page }) => {
    // Try to access non-existent project
    await page.goto('/projects/99999');

    // Should redirect to error page or dashboard
    await page.waitForURL('/|/dashboard|/unauthorized');
    expect(['/', '/dashboard', '/unauthorized'].some((url) => page.url().includes(url))).toBeTruthy();
  });

  test('should handle network disconnection', async ({ page }) => {
    await page.goto('/projects/1');
    await page.click('button:has-text("Generate Features")');

    // Simulate offline
    await page.context().setOffline(true);

    // Wait for error message
    await page.waitForSelector('[data-testid="offline-message"]', { timeout: 10000 });
    await expect(page.locator('[data-testid="offline-message"]')).toBeVisible();

    // Go online
    await page.context().setOffline(false);

    // Should show retry option
    await expect(page.locator('button:has-text("Retry")')).toBeVisible();
  });

  test('should clear loading state on error', async ({ page }) => {
    await page.goto('/projects/1');

    // Mock error response
    await page.route('**/api/generate/**', (route) => {
      route.abort();
    });

    const generateBtn = page.locator('button:has-text("Generate PRD")');
    await generateBtn.click();

    // Should not be in loading state after error
    await page.waitForSelector('[role="alert"]', { timeout: 10000 });
    await expect(generateBtn).not.toBeDisabled();
  });
});

test.describe('Performance & Accessibility', () => {
  test('should load dashboard in reasonable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button:has-text("Sign In")');

    await page.waitForURL('/dashboard');
    const loadTime = Date.now() - startTime;

    // Should load in under 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/projects/create');

    // Tab through form
    await page.keyboard.press('Tab');
    expect(await page.locator('input[placeholder="Project Name"]').isFocused()).toBeTruthy();

    await page.keyboard.press('Tab');
    expect(await page.locator('textarea[placeholder="Project Description"]').isFocused()).toBeTruthy();

    await page.keyboard.press('Tab');
    expect(await page.locator('select[name="tech_stack"]').isFocused()).toBeTruthy();

    await page.keyboard.press('Tab');
    expect(await page.locator('button:has-text("Create Project")').isFocused()).toBeTruthy();
  });
});
