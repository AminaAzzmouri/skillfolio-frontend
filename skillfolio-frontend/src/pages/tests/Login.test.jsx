import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { withStore, appRender } from '../../tests/render';



describe('<Login />', () => {
  it('navigates to /dashboard on successful login', async () => {
    const loginMock = vi.fn().mockResolvedValue(undefined);
    withStore({ login: loginMock });

    const { default: Login } = await import('../Login.jsx');
    appRender(<Login />);

    await userEvent.type(screen.getByLabelText(/email or username/i), 'neo');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'matrix');
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));

    expect(loginMock).toHaveBeenCalledWith({ identifier: 'neo', password: 'matrix' });
    expect(globalThis.__navigateSpy).toHaveBeenCalledWith('/dashboard');
  });

  it('shows backend error message on failed login', async () => {
    const err = Object.assign(new Error('nope'), {
      response: { data: { detail: 'Invalid credentials' } },
    });
    const loginMock = vi.fn().mockRejectedValue(err);
    withStore({ login: loginMock });

    const { default: Login } = await import('../Login.jsx');
    appRender(<Login />);

    await userEvent.type(screen.getByLabelText(/email or username/i), 'neo');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
    expect(globalThis.__navigateSpy).not.toHaveBeenCalled();
  });

  it('renders form controls', async () => {
    withStore({});
    const { default: Login } = await import('../Login.jsx');
    appRender(<Login />);

    expect(screen.getByRole('heading', { name: /log in to skillfolio/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email or username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /create one/i })).toHaveAttribute('href', '/register');
  });
});