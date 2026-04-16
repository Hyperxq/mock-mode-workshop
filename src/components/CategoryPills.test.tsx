import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { CategoryPills } from './CategoryPills';

/**
 * PURE COMPONENT UNIT TEST.
 *
 * `CategoryPills` is a controlled component — it takes `active`
 * and `onChange` as props, exposes a pill per category, and
 * reports clicks upstream. Tests here only verify that contract.
 */

describe('CategoryPills', () => {
  it('renders a pill per category plus the "All" catch-all', () => {
    render(<CategoryPills active="all" onChange={() => {}} />);

    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Beachfront' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cabins' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'City' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tropical' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mountain' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Design' })).toBeInTheDocument();
  });

  it('marks the active pill with aria-pressed=true and the rest false', () => {
    render(<CategoryPills active="beachfront" onChange={() => {}} />);

    expect(screen.getByRole('button', { name: 'Beachfront' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('forwards the clicked category key to onChange', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<CategoryPills active="all" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Mountain' }));

    expect(onChange).toHaveBeenCalledExactlyOnceWith('mountain');
  });
});
