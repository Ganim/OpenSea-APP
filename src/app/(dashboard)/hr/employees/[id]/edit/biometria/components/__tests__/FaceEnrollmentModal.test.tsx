/**
 * FaceEnrollmentModal — behavior test
 *
 * Key assertion (D-07 consent gate before capture): the "Iniciar captura"
 * button is disabled while the LGPD consent checkbox is unchecked. Clicking
 * the checkbox enables the button. No frame processing or getUserMedia
 * call happens before consent is accepted.
 */

import { FaceEnrollmentModal } from '@/components/hr/biometria/FaceEnrollmentModal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/* -------------------------------------------------------------------------- */
/* Mock face-api so the modal's model load resolves synchronously and no      */
/* actual TFJS initialization happens.                                        */
/* -------------------------------------------------------------------------- */

vi.mock('@vladmandic/face-api', () => {
  const loadFromUri = vi.fn().mockResolvedValue(undefined);
  return {
    nets: {
      tinyFaceDetector: { loadFromUri },
      faceLandmark68Net: { loadFromUri },
      faceRecognitionNet: { loadFromUri },
    },
    detectAllFaces: vi.fn().mockResolvedValue([]),
    detectSingleFace: vi.fn().mockReturnValue({
      withFaceLandmarks: () => ({
        withFaceDescriptor: () => Promise.resolve(null),
      }),
    }),
    TinyFaceDetectorOptions: class {},
  };
});

/* -------------------------------------------------------------------------- */
/* Mock the service so the mutation never fires a real POST.                  */
/* -------------------------------------------------------------------------- */

vi.mock('@/services/hr/face-enrollments.service', () => ({
  faceEnrollmentsService: {
    create: vi.fn().mockResolvedValue({ enrollments: [], replacedCount: 0 }),
    list: vi.fn().mockResolvedValue({ items: [], count: 0 }),
    remove: vi.fn().mockResolvedValue({ removedCount: 0 }),
  },
  createFaceEnrollments: vi.fn(),
  listFaceEnrollments: vi.fn(),
  removeFaceEnrollments: vi.fn(),
}));

/* -------------------------------------------------------------------------- */
/* Guard: getUserMedia MUST NOT be called before consent is checked.           */
/* -------------------------------------------------------------------------- */

const getUserMediaMock = vi.fn().mockResolvedValue({
  getTracks: () => [{ stop: vi.fn() }],
});

beforeEach(() => {
  getUserMediaMock.mockClear();
  Object.defineProperty(global.navigator, 'mediaDevices', {
    configurable: true,
    value: { getUserMedia: getUserMediaMock },
  });
});

function renderModal() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <FaceEnrollmentModal
        isOpen
        onClose={() => undefined}
        employeeId="emp-123"
        employeeName="João da Silva"
      />
    </QueryClientProvider>
  );
}

describe('FaceEnrollmentModal — consent gate before capture', () => {
  it('disables "Iniciar captura" until the LGPD consent is accepted', async () => {
    const user = userEvent.setup();
    renderModal();

    // Wait for the mocked models to resolve so the button becomes
    // "Iniciar captura" (not "Preparando…").
    const startButton = await waitFor(() =>
      screen.getByTestId('enrollment-start-capture')
    );
    await waitFor(() => {
      expect(startButton).toHaveTextContent(/Iniciar captura/i);
    });

    // While consent is unchecked: the button is disabled and getUserMedia
    // MUST NOT have been invoked.
    expect(startButton).toBeDisabled();
    expect(getUserMediaMock).not.toHaveBeenCalled();

    // Tick the consent checkbox.
    const checkbox = screen.getByTestId('enrollment-consent-checkbox');
    await user.click(checkbox);

    // Button is now enabled, but we still haven't clicked it, so the camera
    // has NOT been started. This codifies: consent alone doesn't auto-start
    // capture — user must explicitly click the CTA.
    await waitFor(() => expect(startButton).toBeEnabled());
    expect(getUserMediaMock).not.toHaveBeenCalled();
  });

  it('renders the locked consent text verbatim', () => {
    renderModal();
    // Exact snippet from the UI-SPEC locked copy + CONSENT_TEXT_TEMPLATE.
    expect(screen.getByText(/dados biométricos faciais/i)).toBeInTheDocument();
    expect(
      screen.getByText(/exclusivamente para fins de registro de ponto/i)
    ).toBeInTheDocument();
  });
});
