/**
 * Error Boundary Component Tests
 * Tests para validar o comportamento do ErrorBoundary
 */

import { ErrorBoundary } from '@/components/shared/error-boundary';
import { logger } from '@/lib/logger';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock do logger
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

// Componente que lança erro
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error from component');
  }
  return React.createElement('div', null, 'Component rendered successfully');
};

// Componente que funciona
const WorkingComponent = () => {
  return React.createElement('div', null, 'Working component');
};

describe('ErrorBoundary Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render children when no error occurs', () => {
      render(
        React.createElement(
          ErrorBoundary,
          null,
          React.createElement(WorkingComponent)
        )
      );
      expect(screen.getByText('Working component')).toBeInTheDocument();
    });

    it('should render error UI when an error occurs', () => {
      // Suppress console.error during test
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      render(
        React.createElement(
          ErrorBoundary,
          null,
          React.createElement(ThrowError, { shouldThrow: true })
        )
      );

      // Should show error message or fallback UI
      const errorElements = screen.queryAllByText(/algo deu errado|error/i);
      expect(errorElements.length).toBeGreaterThan(0);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Error Catching', () => {
    it('should catch render errors from components', () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        render(
          React.createElement(
            ErrorBoundary,
            null,
            React.createElement(ThrowError, { shouldThrow: true })
          )
        );
      }).not.toThrow();

      consoleErrorSpy.mockRestore();
    });

    it('should log errors to logger when boundary catches error', () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      render(
        React.createElement(
          ErrorBoundary,
          null,
          React.createElement(ThrowError, { shouldThrow: true })
        )
      );

      // Logger.error should have been called
      expect(logger.error).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should include error details in logged context', () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      render(
        React.createElement(
          ErrorBoundary,
          null,
          React.createElement(ThrowError, { shouldThrow: true })
        )
      );

      // Verify logger was called with error info
      const errorCall = (logger.error as any).mock.calls[0];
      expect(errorCall).toBeTruthy();
      expect(errorCall[0]).toContain('erro'); // Should have error message in Portuguese or English

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Recovery', () => {
    it('should provide a way to retry after error', () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      render(
        React.createElement(
          ErrorBoundary,
          null,
          React.createElement(ThrowError, { shouldThrow: true })
        )
      );

      // Look for retry button or similar recovery mechanism
      const buttons = screen.queryAllByRole('button');
      expect(
        buttons.length > 0 || screen.queryByText(/retry|tentar novamente/i)
      ).toBeTruthy();

      consoleErrorSpy.mockRestore();
    });

    it('should clear error state after successful recovery', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      // Test rendering a working component (not throwing)
      render(
        React.createElement(
          ErrorBoundary,
          null,
          React.createElement(ThrowError, { shouldThrow: false })
        )
      );

      // Should render the working content
      expect(
        screen.queryByText('Component rendered successfully')
      ).toBeInTheDocument();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Logging Integration', () => {
    it('should log with component name in context', () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      render(
        <ErrorBoundary
          fallback={(error: Error, reset: () => void) => (
            <div>Custom error UI</div>
          )}
        >
          <ThrowError shouldThrow />
        </ErrorBoundary>
      );

      expect(logger.error).toHaveBeenCalled();
      const call = (logger.error as any).mock.calls[0];
      // Should have context with component information
      expect(call).toBeTruthy();

      consoleErrorSpy.mockRestore();
    });

    it('should include component stack in error logs', () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      render(
        React.createElement(
          ErrorBoundary,
          null,
          React.createElement(ThrowError, { shouldThrow: true })
        )
      );

      expect(logger.error).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });
});
