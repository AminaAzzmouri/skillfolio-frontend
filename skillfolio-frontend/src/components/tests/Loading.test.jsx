import { render, screen } from '@testing-library/react';
import Loading from '../../components/Loading.jsx';

describe('Loading', () => {
  it('renders default text by default', () => {
    render(<Loading />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders custom text', () => {
    render(<Loading text="Fetching…" />);
    expect(screen.getByText('Fetching…')).toBeInTheDocument();
  });
});
