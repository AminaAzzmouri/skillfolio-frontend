import { render, screen } from '@testing-library/react';
import EmptyState from '../../components/EmptyState.jsx';

describe('EmptyState', () => {
  it('renders default message', () => {
    render(<EmptyState />);
    expect(screen.getByText(/nothing here yet/i)).toBeInTheDocument();
  });

  it('renders custom message', () => {
    render(<EmptyState message="No goals yet." />);
    expect(screen.getByText('No goals yet.')).toBeInTheDocument();
  });

  it('applies error styles when isError', () => {
    render(<EmptyState message="Boom" isError />);
    expect(screen.getByText('Boom')).toBeInTheDocument();
  });
});
