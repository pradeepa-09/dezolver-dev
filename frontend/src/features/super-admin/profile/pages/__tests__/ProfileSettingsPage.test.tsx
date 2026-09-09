import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ProfileSettingsPage } from '../ProfileSettingsPage';

function renderProfileSettingsPage() {
  return render(
    <MemoryRouter>
      <ProfileSettingsPage />
    </MemoryRouter>,
  );
}

describe('ProfileSettingsPage', () => {
  it('renders page header and tabs', () => {
    renderProfileSettingsPage();
    expect(screen.getByText('Profile Settings')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Profile$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Security$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Notifications$/i })).toBeInTheDocument();
  });

  it('renders Profile tab fields and handles form submission', async () => {
    const user = userEvent.setup();
    renderProfileSettingsPage();

    expect(screen.getByDisplayValue('Rahul Kumar')).toBeInTheDocument();
    expect(screen.getByDisplayValue('rahul.kumar@sunrise.edu.in')).toBeInTheDocument();
    expect(screen.getByDisplayValue('+91 98765 43210')).toBeInTheDocument();

    const saveButton = screen.getByRole('button', { name: /Save Changes/i });
    await user.click(saveButton);

    expect(screen.getByText(/Profile information updated successfully/i)).toBeInTheDocument();
  });

  it('switches to Security tab, validates inputs and updates password', async () => {
    const user = userEvent.setup();
    renderProfileSettingsPage();

    // Click Security Tab
    await user.click(screen.getByRole('button', { name: /^Security$/i }));

    expect(screen.getByText('Change Password')).toBeInTheDocument();
    expect(screen.getByText(/Password requirements:/i)).toBeInTheDocument();
    expect(screen.getByText(/At least 8 characters/i)).toBeInTheDocument();

    // Fill out password form
    const currentPassInput = screen.getByPlaceholderText('••••••••');
    const newPassInput = screen.getByPlaceholderText(/Min 8 chars, 1 uppercase, 1 number/i);
    const confirmPassInput = screen.getByPlaceholderText(/Repeat new password/i);

    fireEvent.change(currentPassInput, { target: { value: 'oldpassword123' } });
    fireEvent.change(newPassInput, { target: { value: 'Newpassword@123' } });
    fireEvent.change(confirmPassInput, { target: { value: 'Newpassword@123' } });

    const updateButton = screen.getByRole('button', { name: /Update Password/i });
    await user.click(updateButton);

    expect(screen.getByText(/Password updated successfully/i)).toBeInTheDocument();
  });

  it('switches to Notifications tab and toggles notification preferences', async () => {
    const user = userEvent.setup();
    renderProfileSettingsPage();

    // Click Notifications Tab
    await user.click(screen.getByRole('button', { name: /^Notifications$/i }));

    expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
    expect(screen.getByText('Assessment reminders')).toBeInTheDocument();
    expect(screen.getByText('Lab assignment deadlines')).toBeInTheDocument();
    expect(screen.getByText('Contest announcements')).toBeInTheDocument();
    expect(screen.getByText('Certificate issued')).toBeInTheDocument();
    expect(screen.getByText('Ticket updates')).toBeInTheDocument();
    expect(screen.getByText('Marketing emails')).toBeInTheDocument();

    const switches = screen.getAllByRole('switch');
    expect(switches.length).toBe(6);

    // Toggle a switch
    await user.click(switches[0]);

    const savePrefButton = screen.getByRole('button', { name: /Save Preferences/i });
    await user.click(savePrefButton);

    expect(screen.getByText(/Notification preferences saved successfully/i)).toBeInTheDocument();
  });
});
