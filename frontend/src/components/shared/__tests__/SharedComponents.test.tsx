import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { LoadingState } from '../LoadingState';
import { ErrorState } from '../ErrorState';
import { EmptyState } from '../EmptyState';
import { SuccessState } from '../SuccessState';
import { PermissionDeniedState } from '../PermissionDeniedState';
import { ConfirmDialog } from '../ConfirmDialog';

describe('Shared UI Components', () => {
  it('renders LoadingState with custom title and description', () => {
    render(<LoadingState title="Custom Loading Title" description="Loading details here" />);
    expect(screen.getByText('Custom Loading Title')).toBeInTheDocument();
    expect(screen.getByText('Loading details here')).toBeInTheDocument();
  });

  it('renders ErrorState with retry trigger', async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    render(<ErrorState title="Failed To Load" message="Network timed out" onRetry={onRetry} />);

    expect(screen.getByText('Failed To Load')).toBeInTheDocument();
    expect(screen.getByText('Network timed out')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Try Again/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders EmptyState with action button', async () => {
    const onAction = vi.fn();
    const user = userEvent.setup();
    render(
      <EmptyState
        title="No Colleges Found"
        description="There are currently no colleges registered."
        actionLabel="Register College"
        onAction={onAction}
      />,
    );

    expect(screen.getByText('No Colleges Found')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Register College/i }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('renders SuccessState', () => {
    render(<SuccessState title="Operation Successful" message="College was created" />);
    expect(screen.getByText('Operation Successful')).toBeInTheDocument();
    expect(screen.getByText('College was created')).toBeInTheDocument();
  });

  it('renders PermissionDeniedState with required role', () => {
    render(
      <MemoryRouter>
        <PermissionDeniedState requiredRole="SUPER_ADMIN" />
      </MemoryRouter>,
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText('SUPER_ADMIN')).toBeInTheDocument();
  });

  it('renders ConfirmDialog and triggers confirm / cancel callbacks', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const user = userEvent.setup();

    const { rerender } = render(
      <ConfirmDialog
        isOpen={true}
        title="Confirm Deletion"
        description="Are you sure you want to delete this record?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Confirm/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);

    rerender(
      <ConfirmDialog
        isOpen={false}
        title="Confirm Deletion"
        description="Are you sure you want to delete this record?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );
    expect(screen.queryByText('Confirm Deletion')).not.toBeInTheDocument();
  });
});
