import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { withStore, appRender } from '../../tests/render';

describe('<Register />', () => {
  it('renders the form controls', async () => {
    withStore({});
    const { default: Register } = await import('../Register.jsx');
    appRender(<Register />);

    expect(screen.getByRole('heading', { name: /create your skillfolio account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('shows error if passwords do not match', async () => {
    withStore({});
    const { default: Register } = await import('../Register.jsx');
    appRender(<Register />);

    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'abc12345');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'mismatch');
    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
    expect(globalThis.__navigateSpy).not.toHaveBeenCalled();
  });

  it('submits successfully and navigates to /login with flash message', async () => {
    const registerMock = vi.fn().mockResolvedValue(undefined);
    withStore({ register: registerMock });

    const { default: Register } = await import('../Register.jsx');
    appRender(<Register />);

    await userEvent.type(screen.getByLabelText(/email/i), 'ok@site.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'abc12345');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'abc12345');
    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(registerMock).toHaveBeenCalledWith({ email: 'ok@site.com', password: 'abc12345' });
    });
    expect(globalThis.__navigateSpy).toHaveBeenCalledWith('/login', {
      state: { msg: 'Account created, please log in.' },
    });
  });

  it('surfaces backend error text', async () => {
    const err = Object.assign(new Error('boom'), {
      response: { data: { detail: 'Email already exists' } },
    });
    const registerMock = vi.fn().mockRejectedValue(err);
    withStore({ register: registerMock });

    const { default: Register } = await import('../Register.jsx');
    appRender(<Register />);

    await userEvent.type(screen.getByLabelText(/email/i), 'dup@site.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'abc12345');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'abc12345');
    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));

    expect(await screen.findByText(/email already exists/i)).toBeInTheDocument();
    expect(globalThis.__navigateSpy).not.toHaveBeenCalled();
  });
});