import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProjectForm from '../ProjectForm';

/**
 * Example React Component Unit Tests
 * This demonstrates testing patterns for your Inertia.js/React components
 */

describe('ProjectForm Component', () => {
  const mockOnSubmit = vi.fn();
  const defaultProps = {
    onSubmit: mockOnSubmit,
    isLoading: false,
    error: null,
  };

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  describe('Rendering', () => {
    it('should render form with all required fields', () => {
      render(<ProjectForm {...defaultProps} />);

      expect(screen.getByLabelText(/project name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/tech stack/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create project/i })).toBeInTheDocument();
    });

    it('should display error message when provided', () => {
      const errorMsg = 'Failed to create project';
      render(<ProjectForm {...defaultProps} error={errorMsg} />);

      expect(screen.getByText(errorMsg)).toBeInTheDocument();
    });

    it('should render with initial values', () => {
      const initialValues = {
        name: 'My Project',
        description: 'Test description',
        techStack: 'React',
      };

      render(<ProjectForm {...defaultProps} initialValues={initialValues} />);

      expect((screen.getByLabelText(/project name/i) as HTMLInputElement).value).toBe('My Project');
    });
  });

  describe('Validation', () => {
    it('should validate required fields before submission', async () => {
      const user = userEvent.setup();
      render(<ProjectForm {...defaultProps} />);

      const submitBtn = screen.getByRole('button', { name: /create project/i });
      await user.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/project name is required/i)).toBeInTheDocument();
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });

    it('should validate minimum name length', async () => {
      const user = userEvent.setup();
      render(<ProjectForm {...defaultProps} />);

      const nameInput = screen.getByLabelText(/project name/i);
      await user.type(nameInput, 'AB'); // Less than 3 chars

      const submitBtn = screen.getByRole('button', { name: /create project/i });
      await user.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/name must be at least 3 characters/i)).toBeInTheDocument();
      });
    });

    it('should validate description length', async () => {
      const user = userEvent.setup();
      render(<ProjectForm {...defaultProps} />);

      const descInput = screen.getByLabelText(/description/i);
      await user.type(descInput, 'Short');

      const submitBtn = screen.getByRole('button', { name: /create project/i });
      await user.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/description must be at least 10 characters/i)).toBeInTheDocument();
      });
    });
  });

  describe('Submission', () => {
    it('should submit form with valid data', async () => {
      const user = userEvent.setup();
      render(<ProjectForm {...defaultProps} />);

      await user.type(screen.getByLabelText(/project name/i), 'My Awesome App');
      await user.type(screen.getByLabelText(/description/i), 'A test project description');
      await user.selectOption(screen.getByLabelText(/tech stack/i), 'React');

      await user.click(screen.getByRole('button', { name: /create project/i }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'My Awesome App',
          description: 'A test project description',
          techStack: 'React',
        });
      });
    });

    it('should disable submit button while loading', () => {
      const { rerender } = render(<ProjectForm {...defaultProps} isLoading={false} />);

      expect(screen.getByRole('button', { name: /create project/i })).not.toBeDisabled();

      rerender(<ProjectForm {...defaultProps} isLoading={true} />);

      expect(screen.getByRole('button', { name: /create project/i })).toBeDisabled();
    });

    it('should show loading spinner while processing', () => {
      render(<ProjectForm {...defaultProps} isLoading={true} />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should clear error when user starts typing', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<ProjectForm {...defaultProps} error="Previous error" />);

      expect(screen.getByText('Previous error')).toBeInTheDocument();

      rerender(<ProjectForm {...defaultProps} error={null} />);
      const nameInput = screen.getByLabelText(/project name/i);
      await user.type(nameInput, 'Test');

      expect(screen.queryByText('Previous error')).not.toBeInTheDocument();
    });

    it('should handle form reset', async () => {
      const user = userEvent.setup();
      render(<ProjectForm {...defaultProps} />);

      const nameInput = screen.getByLabelText(/project name/i) as HTMLInputElement;
      await user.type(nameInput, 'My Project');

      const resetBtn = screen.getByRole('button', { name: /reset/i });
      await user.click(resetBtn);

      expect(nameInput.value).toBe('');
    });
  });

  describe('Accessibility', () => {
    it('should have proper label associations', () => {
      render(<ProjectForm {...defaultProps} />);

      const nameInput = screen.getByLabelText(/project name/i);
      expect(nameInput).toHaveAttribute('id', expect.any(String));
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(<ProjectForm {...defaultProps} />);

      const nameInput = screen.getByLabelText(/project name/i);
      const descInput = screen.getByLabelText(/description/i);
      const submitBtn = screen.getByRole('button', { name: /create project/i });

      // Tab through form
      await user.tab();
      expect(nameInput).toHaveFocus();

      await user.tab();
      expect(descInput).toHaveFocus();

      await user.tab();
      await user.tab(); // Skip tech stack
      expect(submitBtn).toHaveFocus();
    });

    it('should announce validation errors to screen readers', () => {
      render(<ProjectForm {...defaultProps} error="Validation failed" />);

      const errorElement = screen.getByText('Validation failed');
      expect(errorElement).toHaveAttribute('role', 'alert');
    });
  });
});
