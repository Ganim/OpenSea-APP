import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PunchEvidenceUploader } from './PunchEvidenceUploader';

const uploadEvidenceMock = vi.fn();
const toastErrorMock = vi.fn();
const toastSuccessMock = vi.fn();

vi.mock('@/services/hr/punch-export.service', () => ({
  punchExportService: {
    uploadEvidence: (...args: unknown[]) => uploadEvidenceMock(...args),
    batchResolve: vi.fn(),
    dispatchExport: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    error: (...args: unknown[]) => toastErrorMock(...args),
    success: (...args: unknown[]) => toastSuccessMock(...args),
  },
}));

function makeFile(opts: { name: string; size: number; type: string }): File {
  const blob = new Blob(['x'.repeat(opts.size)], { type: opts.type });
  return new File([blob], opts.name, { type: opts.type });
}

describe('PunchEvidenceUploader', () => {
  beforeEach(() => {
    uploadEvidenceMock.mockReset();
    toastErrorMock.mockReset();
    toastSuccessMock.mockReset();
  });

  it('accepts a PDF file and calls uploadEvidence', async () => {
    uploadEvidenceMock.mockResolvedValue({
      storageKey: 'sk-1',
      size: 1024,
      filename: 'doc.pdf',
    });
    const onUploaded = vi.fn();

    render(
      <PunchEvidenceUploader
        approvalId="appr-1"
        actionPinToken="pin-token"
        onUploaded={onUploaded}
      />
    );

    const input = screen.getByTestId(
      'punch-evidence-input'
    ) as HTMLInputElement;
    const file = makeFile({
      name: 'doc.pdf',
      size: 1024,
      type: 'application/pdf',
    });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(uploadEvidenceMock).toHaveBeenCalledTimes(1));
    expect(uploadEvidenceMock).toHaveBeenCalledWith(
      'appr-1',
      file,
      'pin-token'
    );
    await waitFor(() => expect(onUploaded).toHaveBeenCalledWith(['sk-1']));
  });

  it('rejects a non-PDF file (no upload, error shown)', async () => {
    const onUploaded = vi.fn();

    render(
      <PunchEvidenceUploader
        approvalId="appr-1"
        actionPinToken="pin-token"
        onUploaded={onUploaded}
      />
    );

    const input = screen.getByTestId(
      'punch-evidence-input'
    ) as HTMLInputElement;
    const file = makeFile({
      name: 'image.png',
      size: 1024,
      type: 'image/png',
    });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(toastErrorMock).toHaveBeenCalled());
    expect(uploadEvidenceMock).not.toHaveBeenCalled();
    expect(onUploaded).not.toHaveBeenCalled();
    expect(screen.getByTestId('punch-evidence-error')).toHaveTextContent(
      /PDF/i
    );
  });

  it('rejects a file > 10MB', async () => {
    const onUploaded = vi.fn();

    render(
      <PunchEvidenceUploader
        approvalId="appr-1"
        actionPinToken="pin-token"
        onUploaded={onUploaded}
      />
    );

    const input = screen.getByTestId(
      'punch-evidence-input'
    ) as HTMLInputElement;
    const oversize = makeFile({
      name: 'huge.pdf',
      size: 11 * 1024 * 1024,
      type: 'application/pdf',
    });
    fireEvent.change(input, { target: { files: [oversize] } });

    await waitFor(() => expect(toastErrorMock).toHaveBeenCalled());
    expect(uploadEvidenceMock).not.toHaveBeenCalled();
    expect(onUploaded).not.toHaveBeenCalled();
    expect(screen.getByTestId('punch-evidence-error')).toBeInTheDocument();
  });
});
