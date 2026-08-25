import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ForbiddenPage } from '../ForbiddenPage';
import { NotFoundPage } from '../NotFoundPage';

describe('Error Pages', () => {
  it('renders ForbiddenPage (403)', () => {
    render(
      <MemoryRouter>
        <ForbiddenPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /403 - Forbidden/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Return to Login/i })).toBeInTheDocument();
  });

  it('renders NotFoundPage (404)', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /Page Not Found/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Return to Login/i })).toBeInTheDocument();
  });
});
