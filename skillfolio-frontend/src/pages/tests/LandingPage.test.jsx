import { describe, it, expect } from 'vitest';
import { screen, within } from '@testing-library/react';
import { appRender } from '../../tests/render';
import LandingPage from '../LandingPage.jsx';

describe('<LandingPage />', () => {
  it('renders the hero, features, steps, and CTAs', () => {
    appRender(<LandingPage />);

    // HERO (tolerate inline <span> line break)
    const hero = screen.getByRole('heading', { level: 1 });
    expect(hero).toHaveTextContent(/build a portfolio of your\s*learning\./i);

    // Chips/phrases (some appear twice → use All)
    expect(screen.getAllByText(/archive certificates/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/document projects/i)).toBeInTheDocument();
    expect(screen.getAllByText(/track skills/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/hit goals/i)).toBeInTheDocument();

    // FEATURES (unique description lines)
    expect(screen.getByRole('heading', { name: /what to expect/i })).toBeInTheDocument();
    expect(screen.getByText(/upload pdfs or images and keep your achievements organized\./i)).toBeInTheDocument();
    expect(screen.getByText(/explain what you built, the skills you used, and the outcome\./i)).toBeInTheDocument();
    expect(screen.getByText(/set targets, add steps, and track progress with clarity\./i)).toBeInTheDocument();
    expect(screen.getByText(/a clean overview of your latest work and momentum\./i)).toBeInTheDocument();

    // HOW IT WORKS / STEPS
    expect(screen.getByRole('heading', { name: /how skillfolio helps self-learners/i })).toBeInTheDocument();
    const stepsList = screen.getByRole('list'); // the <ol>
    const steps = within(stepsList);
    expect(steps.getByText(/capture your wins/i)).toBeInTheDocument();
    expect(steps.getByText(/connect the dots/i)).toBeInTheDocument();
    expect(steps.getByText(/share your growth/i)).toBeInTheDocument();

    // CTAs
    expect(screen.getByRole('link', { name: /create your account/i })).toHaveAttribute('href', '/register');
    expect(screen.getByRole('link', { name: /log in/i })).toHaveAttribute('href', '/login');
  });
});