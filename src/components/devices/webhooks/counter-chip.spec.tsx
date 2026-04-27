import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { WebhookCounterChip, getCounterTone } from './counter-chip';

describe('getCounterTone (Phase 11 D-34)', () => {
  it('retorna slate quando count < amberThreshold', () => {
    expect(getCounterTone(10, 50, 45)).toBe('slate');
    expect(getCounterTone(0, 50, 45)).toBe('slate');
    expect(getCounterTone(44, 50, 45)).toBe('slate');
  });

  it('retorna amber em [amberThreshold, max-1]', () => {
    expect(getCounterTone(45, 50, 45)).toBe('amber');
    expect(getCounterTone(49, 50, 45)).toBe('amber');
  });

  it('retorna rose quando count === max', () => {
    expect(getCounterTone(50, 50, 45)).toBe('rose');
  });

  it('rose também quando count > max (defesa contra estouro)', () => {
    expect(getCounterTone(51, 50, 45)).toBe('rose');
  });
});

describe('<WebhookCounterChip />', () => {
  it('aplica classes slate quando count=10', () => {
    const { container } = render(
      <WebhookCounterChip count={10} max={50} amberThreshold={45} />
    );
    const chip = container.querySelector(
      '[data-testid="webhook-counter-chip"]'
    );
    expect(chip).toBeTruthy();
    expect(chip?.getAttribute('data-tone')).toBe('slate');
    expect(chip?.className).toContain('slate');
  });

  it('aplica classes amber quando count=45', () => {
    const { container } = render(
      <WebhookCounterChip count={45} max={50} amberThreshold={45} />
    );
    const chip = container.querySelector(
      '[data-testid="webhook-counter-chip"]'
    );
    expect(chip?.getAttribute('data-tone')).toBe('amber');
    expect(chip?.className).toContain('amber');
  });

  it('aplica classes amber quando count=49 (border do limite)', () => {
    const { container } = render(
      <WebhookCounterChip count={49} max={50} amberThreshold={45} />
    );
    const chip = container.querySelector(
      '[data-testid="webhook-counter-chip"]'
    );
    expect(chip?.getAttribute('data-tone')).toBe('amber');
    expect(chip?.className).toContain('amber');
  });

  it('aplica classes rose quando count=50 (limite atingido)', () => {
    const { container } = render(
      <WebhookCounterChip count={50} max={50} amberThreshold={45} />
    );
    const chip = container.querySelector(
      '[data-testid="webhook-counter-chip"]'
    );
    expect(chip?.getAttribute('data-tone')).toBe('rose');
    expect(chip?.className).toContain('rose');
  });

  it('renderiza texto "50 de 50 webhooks" no limite', () => {
    const { container } = render(
      <WebhookCounterChip count={50} max={50} amberThreshold={45} />
    );
    expect(container.textContent).toContain('50 de 50 webhooks');
  });

  it('respeita unit customizada', () => {
    const { container } = render(
      <WebhookCounterChip
        count={3}
        max={10}
        amberThreshold={8}
        unit="endpoints"
      />
    );
    expect(container.textContent).toContain('3 de 10 endpoints');
  });
});
