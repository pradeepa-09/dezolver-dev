import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { CreateCollegeModal } from '../CreateCollegeModal';
import { EditCollegeModal } from '../EditCollegeModal';
import { CollegeDetailsModal } from '../CollegeDetailsModal';
import { ImpersonationBanner } from '../ImpersonationBanner';
import { ImpersonationContext } from '../../context/ImpersonationContext';
import { collegesApi } from '../../api/collegesApi';
import type { College, CollegeDetail } from '@/types/colleges';

describe('College Modals & ImpersonationBanner', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('CreateCollegeModal', () => {
    it('validates required name field and submits to API', async () => {
      const user = userEvent.setup();
      const mockSuccess = vi.fn();
      const mockCreate = vi.spyOn(collegesApi, 'createCollege').mockResolvedValue({
        college: {
          id: 'col-new',
          name: 'Caltech',
          domain: 'caltech.edu',
          status: 'ACTIVE',
          createdAt: '2026-08-25T00:00:00.000Z',
          updatedAt: '2026-08-25T00:00:00.000Z',
        },
        financeUser: {
          id: 'u-new',
          email: 'finance_colnew@caltech.edu',
          role: 'ADMIN',
          collegeId: 'col-new',
          isActive: true,
          createdAt: '2026-08-25T00:00:00.000Z',
          updatedAt: '2026-08-25T00:00:00.000Z',
        },
      });

      render(
        <CreateCollegeModal
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={mockSuccess}
        />,
      );

      // Attempt submit without name
      await user.click(screen.getByRole('button', { name: /Create College/i }));
      expect(screen.getByText('College name is required')).toBeInTheDocument();
      expect(mockCreate).not.toHaveBeenCalled();

      // Enter valid name and domain
      await user.type(screen.getByLabelText(/College Name \*/i), 'Caltech');
      await user.type(screen.getByLabelText(/Domain \*/i), 'caltech.edu');
      await user.click(screen.getByRole('button', { name: /Create College/i }));

      await waitFor(() => {
        expect(mockCreate).toHaveBeenCalledWith({
          name: 'Caltech',
          domain: 'caltech.edu',
        });
        expect(screen.getByText(/College Created Successfully!/i)).toBeInTheDocument();
        expect(screen.getByText('finance_colnew@caltech.edu')).toBeInTheDocument();
      });
    });
  });

  describe('EditCollegeModal', () => {
    it('pre-fills college name and submits update', async () => {
      const user = userEvent.setup();
      const mockSuccess = vi.fn();
      const mockCollege: College = {
        id: 'col-1',
        name: 'MIT',
        domain: 'mit.edu',
        status: 'ACTIVE',
        createdAt: '2026-08-25T00:00:00.000Z',
        updatedAt: '2026-08-25T00:00:00.000Z',
      };

      const mockUpdate = vi.spyOn(collegesApi, 'updateCollege').mockResolvedValue({
        ...mockCollege,
        name: 'MIT Updated',
      });

      render(
        <EditCollegeModal
          college={mockCollege}
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={mockSuccess}
        />,
      );

      const nameInput = screen.getByLabelText(/College Name/i);
      expect(nameInput).toHaveValue('MIT');

      await user.clear(nameInput);
      await user.type(nameInput, 'MIT Updated');
      await user.click(screen.getByRole('button', { name: /Save Changes/i }));

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith('col-1', {
          name: 'MIT Updated',
          domain: 'mit.edu',
        });
        expect(mockSuccess).toHaveBeenCalled();
      });
    });
  });

  describe('CollegeDetailsModal', () => {
    it('loads and renders all 5 real detail tabs', async () => {
      const user = userEvent.setup();
      const mockDetail: CollegeDetail = {
        id: 'col-123',
        name: 'Stanford University',
        domain: 'stanford.edu',
        status: 'ACTIVE',
        createdAt: '2026-08-25T10:00:00.000Z',
        updatedAt: '2026-08-25T11:00:00.000Z',
        users: [
          {
            id: 'u-1',
            email: 'finance_col123@stanford.edu',
            role: 'ADMIN',
            isActive: true,
          },
        ],
        subscriptions: [
          {
            id: 'sub-1',
            status: 'ACTIVE',
            createdAt: '2026-08-25T10:00:00.000Z',
            updatedAt: '2026-08-25T10:00:00.000Z',
            plan: {
              id: 'plan-1',
              name: 'Enterprise Tier',
              description: 'Full institutional suite',
            },
          },
        ],
        activityLogs: [
          {
            id: 'act-1',
            action: 'COLLEGE_CREATED',
            createdAt: '2026-08-25T10:00:00.000Z',
            actor: {
              id: 'super-1',
              email: 'admin@dev.local',
              role: 'SUPER_ADMIN',
            },
          },
        ],
      };

      vi.spyOn(collegesApi, 'getCollege').mockResolvedValue(mockDetail);

      render(
        <CollegeDetailsModal
          collegeId="col-123"
          isOpen={true}
          onClose={vi.fn()}
        />,
      );

      // Tab 1: Overview
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Stanford University' })).toBeInTheDocument();
        expect(screen.getByText('stanford.edu')).toBeInTheDocument();
      });

      // Tab 2: Seats & Plan
      await user.click(screen.getByRole('button', { name: /Seats & Plan/i }));
      expect(screen.getByText('Enterprise Tier')).toBeInTheDocument();
      expect(screen.getByText('Full institutional suite')).toBeInTheDocument();

      // Tab 3: Finance Team Contact
      await user.click(screen.getByRole('button', { name: /Finance Team Contact/i }));
      expect(screen.getAllByText('finance_col123@stanford.edu').length).toBeGreaterThan(0);
      expect(screen.getByText(/Finance Team \(ADMIN\)/i)).toBeInTheDocument();

      // Tab 4: Billing History
      await user.click(screen.getByRole('button', { name: /Billing History/i }));
      expect(screen.getByText('No invoices yet')).toBeInTheDocument();

      // Tab 5: Activity Log
      await user.click(screen.getByRole('button', { name: /Activity Log/i }));
      expect(screen.getByText('COLLEGE_CREATED')).toBeInTheDocument();
      expect(screen.getByText('admin@dev.local')).toBeInTheDocument();
    });
  });

  describe('ImpersonationBanner', () => {
    it('renders impersonation banner, countdown, and triggers stop callback on return', async () => {
      const mockStop = vi.fn();
      const user = userEvent.setup();
      const expiresAt = new Date(Date.now() + 3500 * 1000).toISOString();

      render(
        <MemoryRouter>
          <ImpersonationContext.Provider
            value={{
              isImpersonating: true,
              impersonationToken: 'token-abc',
              expiresAt,
              targetCollege: { id: 'col-1', name: 'Harvard University' },
              financeUser: { id: 'u-1', email: 'finance@harvard.edu' },
              isLoading: false,
              startImpersonation: vi.fn(),
              stopImpersonation: mockStop,
            }}
          >
            <ImpersonationBanner />
          </ImpersonationContext.Provider>
        </MemoryRouter>,
      );

      expect(screen.getByText(/Viewing as Finance Team/i)).toBeInTheDocument();
      expect(screen.getByText('Harvard University')).toBeInTheDocument();
      expect(screen.getByText('(finance@harvard.edu)')).toBeInTheDocument();
      expect(screen.getByText(/remaining/i)).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /Return to Super Admin/i }));
      expect(mockStop).toHaveBeenCalledTimes(1);
    });
  });
});
