import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { useMockStore } from '../stores/mock.store';
import { MockToggle } from './MockToggle';

/**
 * COMPONENT UNIT TEST — mocks the Zustand store at the import
 * boundary so the component can be exercised without any of the
 * MSW infrastructure being loaded.
 *
 * The contract we care about:
 *   - isAvailable=false → "Mock unavailable" disabled pill.
 *   - isAvailable=true + isEnabled=false → clickable "Mock OFF".
 *   - isAvailable=true + isEnabled=true  → clickable "Mock ON".
 *   - Clicking invokes `toggle`.
 */

vi.mock('../stores/mock.store', () => ({
  useMockStore: vi.fn(),
}));

type StoreShape = {
  isEnabled: boolean;
  isAvailable: boolean;
  toggle: () => Promise<void>;
};

function mockStore(state: StoreShape) {
  // useMockStore is a selector-based hook — each call picks a slice.
  vi.mocked(useMockStore).mockImplementation(((selector: (s: StoreShape) => unknown) =>
    selector(state)) as unknown as typeof useMockStore);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('MockToggle', () => {
  it('renders a disabled "Mock unavailable" pill when mocking was never bootstrapped', () => {
    mockStore({ isEnabled: false, isAvailable: false, toggle: vi.fn() });

    render(<MockToggle />);

    const pill = screen.getByRole('button', { name: /mock unavailable/i });
    expect(pill).toBeDisabled();
  });

  it('renders a clickable "Mock OFF" pill when available but disabled', () => {
    mockStore({ isEnabled: false, isAvailable: true, toggle: vi.fn() });

    render(<MockToggle />);

    const pill = screen.getByRole('button', { name: /mock off/i });
    expect(pill).toBeEnabled();
    expect(pill).toHaveAttribute('aria-pressed', 'false');
  });

  it('renders a clickable "Mock ON" pill when enabled', () => {
    mockStore({ isEnabled: true, isAvailable: true, toggle: vi.fn() });

    render(<MockToggle />);

    const pill = screen.getByRole('button', { name: /mock on/i });
    expect(pill).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls toggle() once when the pill is clicked', async () => {
    const toggle = vi.fn().mockResolvedValue(undefined);
    mockStore({ isEnabled: false, isAvailable: true, toggle });

    const user = userEvent.setup();
    render(<MockToggle />);
    await user.click(screen.getByRole('button', { name: /mock off/i }));

    expect(toggle).toHaveBeenCalledTimes(1);
  });
});
