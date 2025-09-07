import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { appRender } from '../../tests/render';
import Home from '../Home.jsx';

// --- Mocks ---
// Framer Motion: render children directly
vi.mock('framer-motion', () => ({
  motion: new Proxy({}, { get: () => (props) => props.children }),
}));

// Icon: simple span
vi.mock('lucide-react', () => ({
  Sparkles: () => <span data-testid="sparkles-icon" />,
}));

// Modal: render children only when open
vi.mock('../../components/Modal', () => ({
  default: ({ open, children }) => (open ? <div data-testid="modal">{children}</div> : null),
}));

// Sections: simple markers so we know they rendered
vi.mock('../../sections/AnnouncementsSection', () => ({
  default: () => <div data-testid="announcements-section">Announcements</div>,
}));
vi.mock('../../sections/PlatformDiscoverySection', () => ({
  default: () => <div data-testid="platform-discovery-section">Platform Discovery</div>,
}));

// GoalForm: we won't open it in this smoke test, keep minimal
vi.mock('../../components/forms/GoalForm', () => ({
  default: () => <div data-testid="goal-form">GoalForm</div>,
}));

// Facts: controllable mock
vi.mock('../../lib/facts', () => {
  return {
    fetchRandomFact: vi.fn(),
  };
});
import { fetchRandomFact } from '../../lib/facts';

describe('<Home />', () => {
  it('renders welcome, sections, and the fact box; loads and refreshes a fact', async () => {
    // First load returns a fact
    fetchRandomFact.mockResolvedValueOnce({
      text: 'Honey never spoils.',
      url: 'https://example.com/honey',
      source: 'Example Source',
    });
    // Second load (after clicking "New fact") returns another
    fetchRandomFact.mockResolvedValueOnce({
      text: 'Octopuses have three hearts.',
      url: '',
      source: 'Ocean Facts',
    });

    appRender(<Home />);

    // Welcome header (store defaults to no user → "there")
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(/welcome back,\s*there/i);

    // Sections render
    expect(screen.getByTestId('announcements-section')).toBeInTheDocument();
    expect(screen.getByTestId('platform-discovery-section')).toBeInTheDocument();

    // "Did you know?" aside and icon present
    expect(screen.getByText(/did you know\?/i)).toBeInTheDocument();
    expect(screen.getByTestId('sparkles-icon')).toBeInTheDocument();

    // Fact loads on mount
    expect(fetchRandomFact).toHaveBeenCalledTimes(1);
    expect(await screen.findByText(/honey never spoils\./i)).toBeInTheDocument();
    // Source link
    const sourceLink = screen.getByRole('link', { name: /source:\s*example source/i });
    expect(sourceLink).toHaveAttribute('href', 'https://example.com/honey');

    // Click "New fact" → loads another fact
    const btn = screen.getByRole('button', { name: /new fact/i });
    btn.click();

    await waitFor(() => {
      expect(fetchRandomFact).toHaveBeenCalledTimes(2);
    });
    expect(await screen.findByText(/octopuses have three hearts\./i)).toBeInTheDocument();
    // When no url but has source, it renders as plain text
    expect(screen.getByText(/source:\s*ocean facts/i)).toBeInTheDocument();
  });
});