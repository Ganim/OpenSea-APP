import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PunchApprovalBatchBar } from './PunchApprovalBatchBar';

vi.mock('@/services/hr/punch-export.service', () => ({
  punchExportService: {
    batchResolve: vi.fn().mockResolvedValue({
      approved: [],
      rejected: [],
      failed: [],
    }),
    uploadEvidence: vi.fn(),
    dispatchExport: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const verifyActionPinModalSpy = vi.fn();

vi.mock('@/components/modals/verify-action-pin-modal', () => ({
  VerifyActionPinModal: (props: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    title?: string;
    description?: string;
  }) => {
    verifyActionPinModalSpy(props);
    return props.isOpen ? (
      <div data-testid="mock-verify-action-pin-modal">
        <button data-testid="mock-pin-success" onClick={props.onSuccess}>
          succeed
        </button>
        <button data-testid="mock-pin-close" onClick={props.onClose}>
          close
        </button>
      </div>
    ) : null;
  },
}));

describe('PunchApprovalBatchBar', () => {
  beforeEach(() => {
    verifyActionPinModalSpy.mockClear();
  });

  it('renders nothing when selectedCount === 0', () => {
    const { container } = render(<PunchApprovalBatchBar selectedIds={[]} />);
    expect(container.firstChild).toBeNull();
    expect(screen.queryByTestId('punch-batch-bar')).toBeNull();
  });

  it('renders approve and reject buttons when selection > 0 and < threshold', () => {
    render(
      <PunchApprovalBatchBar
        selectedIds={['a-1', 'a-2', 'a-3']}
        pinThreshold={5}
      />
    );
    expect(screen.getByTestId('punch-batch-bar')).toBeInTheDocument();
    expect(screen.getByTestId('punch-batch-approve')).toBeInTheDocument();
    expect(screen.getByTestId('punch-batch-reject')).toBeInTheDocument();
    // Below threshold: PIN warning should NOT appear
    expect(screen.queryByTestId('punch-batch-pin-warning')).toBeNull();
  });

  it('opens VerifyActionPinModal when selection > pinThreshold and Aprovar is clicked', () => {
    const ids = ['a-1', 'a-2', 'a-3', 'a-4', 'a-5', 'a-6'];
    render(<PunchApprovalBatchBar selectedIds={ids} pinThreshold={5} />);
    // PIN warning visible at 6 selected
    expect(screen.getByTestId('punch-batch-pin-warning')).toBeInTheDocument();

    // Click "Aprovar" → PIN modal shows
    fireEvent.click(screen.getByTestId('punch-batch-approve'));
    expect(
      screen.getByTestId('mock-verify-action-pin-modal')
    ).toBeInTheDocument();
    expect(verifyActionPinModalSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({ isOpen: true })
    );
  });
});
