import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// ---- Handlers used across tests (Profile + Dashboard) ----
export const handlers = [
  // ===== Profile page calls =====
  http.get('*/api/me', () =>
    HttpResponse.json({ username: 'x', email: 'user@site.com' })
  ),

  http.put('*/api/profile/', async ({ request }) => {
    const body = await request.json().catch(() => ({}));
    if (body?.username === 'bad') {
      return HttpResponse.json(
        { username: ['This username is not available'] },
        { status: 400 }
      );
    }
    return HttpResponse.json({
      username: body?.username ?? 'x',
      email: body?.email ?? 'user@site.com',
    });
  }),

  http.post('*/api/password-change/', async ({ request }) => {
    const body = await request.json().catch(() => ({}));
    if (body?.new_password === 'weak') {
      return HttpResponse.json({ detail: 'Password too weak' }, { status: 400 });
    }
    return HttpResponse.json({ detail: 'Password changed successfully' });
  }),

  http.delete('*/api/account/delete/', () => new HttpResponse(null, { status: 204 })),

  // ===== Dashboard page calls =====
  // Store lists (recent sections)
  http.get('*/api/certificates/', () =>
    HttpResponse.json({
      results: [
        {
          id: 1,
          title: 'React Nanodegree',
          issuer: 'Udacity',
          date_earned: '2024-01-01',
          file_upload: '/files/cert1.png',
        },
        {
          id: 2,
          title: 'Algorithms',
          issuer: 'Coursera',
          date_earned: '2024-03-10',
          file_upload: '/files/cert2.pdf',
        },
        { id: 3, title: 'Linux Essentials', issuer: 'LPI', date_earned: '2023-12-01' },
      ],
    })
  ),

  http.get('*/api/projects/', () =>
    HttpResponse.json({
      results: [
        { id: 11, title: 'Portfolio Site', status: 'completed', description: 'Personal site.' },
        { id: 12, title: 'Dashboard UI', status: 'in_progress', description: 'React + Tailwind.' },
        { id: 13, title: 'API Client', status: 'planned', description: 'Axios wrapper.' },
      ],
    })
  ),

  http.get('*/api/goals/', () =>
    HttpResponse.json({
      results: [
        {
          id: 21,
          title: 'Build 5 Projects',
          target_projects: 5,
          deadline: '2025-12-31',
          projects_progress_percent: 60,
        },
        {
          id: 22,
          title: 'Earn 3 Certificates',
          target_projects: 3,
          deadline: '2025-08-30',
          projects_progress_percent: 33,
        },
        {
          id: 23,
          title: 'Open Source PRs',
          target_projects: 10,
          deadline: '2025-10-15',
          projects_progress_percent: 10,
        },
      ],
    })
  ),

  // Analytics summary
  http.get('*/api/analytics/summary/', () =>
    HttpResponse.json({
      certificates_count: 7,
      projects_count: 12,
      goals_count: 3,
      goals_completed_count: 1,
      goals_completion_rate_percent: 33,
    })
  ),

  // Analytics goals progress
  http.get('*/api/analytics/goals-progress/', () =>
    HttpResponse.json([
      { steps_progress_percent: 40, progress_percent: 40 },
      { steps_progress_percent: 60, progress_percent: 60 },
      { progress_percent: 80 }, // falls back to progress_percent if steps_progress_percent missing
    ])
  ),

  // ===== Static assets & PDFs used in previews =====
  http.get('/files/', () => new HttpResponse(null, { status: 200 })),

  // ===== Final safety net for odd calls in jsdom (images, icons, CSS) =====
  http.all(/.*\.(png|jpg|jpeg|gif|webp|svg|css|ico)$/, () =>
    new HttpResponse(null, { status: 200 })
  ),
];

// Export a single server instance
export const server = setupServer(...handlers);