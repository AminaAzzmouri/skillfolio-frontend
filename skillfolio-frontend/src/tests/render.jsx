import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

// zustand store mocking
export function withStore(partial = {}) {
  vi.doMock('../store/useAppStore', () => {
    // default noop actions
    const base = {
      user: null,
      profileLoading: false,
      profileError: '',
      fetchProfile: vi.fn().mockResolvedValue(undefined),
      updateProfile: vi.fn().mockResolvedValue(undefined),
      updatePassword: vi.fn().mockResolvedValue(undefined),
      deleteMyAccount: vi.fn().mockResolvedValue(undefined),
      goals: [],
      goalsLoading: false,
      goalsError: '',
      fetchGoals: vi.fn().mockResolvedValue(undefined),
      createGoal: vi.fn().mockResolvedValue({ id: 999, title: 'New goal' }),
      updateGoal: vi.fn().mockResolvedValue(undefined),
      deleteGoal: vi.fn().mockResolvedValue(undefined),
      flash: null,
      ...partial,
    };
    return { useAppStore: (sel) => sel(base) };
  });
}

export function appRender(ui, route = '/') {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>);
}
