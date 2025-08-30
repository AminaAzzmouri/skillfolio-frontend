
# Announcements (Enrollments & Deals)

## Purpose
================================================================================

A lightweight, static data pipeline that lets the app surface course enrollments and discounts without needing a backend right now. It powers:

        - A grid of announcements on the Home page.
        - A “Save as Goal” CTA that pre-fills the Goal form from an announcement.

This is intentionally simple: we read a JSON file from /public/announcements.json, render it, and give users a quick way to turn an opportunity into action.

## Why this exists (vs. live data)
================================================================================

- Speed of iteration: Eliminates backend work while you shape the UI/UX.
- Predictability: Zero 3rd-party flakiness while you test copy, filters, and the “Save as Goal” flow.
- Design alignment: Forces us to define the data shape (schema) that a future backend or external feed must satisfy.

> When you’re ready, you can swap the static JSON fetch for a backend endpoint (see “Future improvements” below).

## How the flow works (at a glance)
================================================================================

/public/announcements.json  -->  fetchAnnouncements()  -->  AnnouncementsSection
    (static JSON)                 (tiny fetch helper)      (filters, grid layout)
                                                          ↘  AnnouncementCard (UI)
                                                             “Save as Goal” → Home modal
                                                              ↘ GoalForm (prefilled via initialDraft)

## File-by-file guide:
================================================================================

### 1) /public/announcements.json

- What it is: A static JSON file deployed with the frontend. Served as a plain file by Vite (dev) or your hosting (prod).

- What it contains: A list of announcement objects with a small, stable schema:

                [
                  {
                    "id": "coursera-ml-2025-02",
                    "platform": "Coursera",
                    "title": "Machine Learning Specialization — Feb intake",
                    "type": "enrollment",                      // "enrollment" | "discount"
                    "url": "https://example.com/course",
                    "starts_at": "2025-02-10",                 // YYYY-MM-DD (optional)
                    "ends_at": "2025-03-01",                   // YYYY-MM-DD (optional)
                    "discount_pct": null,                      // number | null
                    "price_original": null,                    // number | null
                    "price_current": null,                     // number | null
                    "tags": ["AI", "Beginner"]                 // array of strings
                   }
                ]

- Why here: Anything under /public gets served as-is. That means no CORS or auth headaches and super-fast iteration (just edit and refresh).

### 2) src/lib/announcements.js

- What it does: A tiny fetch helper that reads /announcements.json and lightly normalizes the items (ensures fields exist, arrays are arrays, etc).

- Key notes:
                * Adds a ?ts=${Date.now()} cache-buster so you always see the latest file during development.
                * Returns an array of normalized items (strings, numbers, arrays, or null).

- Why separate file: Keeps network logic out of React components and makes the eventual backend switch trivial (change one function, not all call sites).


### src/components/AnnouncementCard.jsx

- What it does: Presents a single announcement.

- Highlights:

                * Shows platform, type, title, optional date range, and discount info when applicable.
                * Primary actions:
                    - Visit: external link to the source (url).
                    - Save as Goal: calls onSaveGoal(item) passed from the parent.
                    - See my progress: a subtle link to the Dashboard.

- Why separate component: Keeps AnnouncementsSection simple and lets you re-use the card elsewhere if needed.

### src/sections/AnnouncementsSection.jsx

- What it does: Fetches, filters, and renders the list.

- UI/UX features:
                * Search by title, platform, or tags.
                * Filter by platform (auto-derived from data).
                * Filter by type (enrollment or discount).
                * Loading and error states.

- Why a “section”: It’s a self-contained block you can drop into multiple pages. Right now it lives on Home, but you could also mount it on a “Discover” page.

### src/pages/Home.jsx (patch)

- What changed: The Home page now:
                * Imports AnnouncementsSection and displays it.
                * Wires “Save as Goal” to open a Modal with GoalForm.
                * Passes an initialDraft to GoalForm so the form is prefilled from the card (e.g., title = “Enroll in: …”, deadline = ends_at, target_projects = 1).

- Why here: The Home page is your cozy, motivating hub. Showing time-sensitive announcements and making it one click to save a goal nudges action.

### src/components/forms/GoalForm.jsx (tiny enhancement)

- What changed: New optional prop initialDraft that pre-fills the create form without switching to edit mode.

- Why this matters: GoalForm can now serve both:
                * Edit (initial) and
                * Create with defaults (initialDraft)

- without contorting the props or duplicating code.

## Data model (schema) reference:
================================================================================

----------------------------------------------------------------------------------------------
| Field                 |              Type                 |            Notes                |
----------------------------------------------------------------------------------------------|
| id                    |             string                | Unique stable ID for keys/links |
|---------------------------------------------------------------------------------------------|
| platform              |             string                | e.g., "Coursera", "Udemy", "edX"|
|---------------------------------------------------------------------------------------------|
| title                 |             string                | Display title                   |
|---------------------------------------------------------------------------------------------|
| type                  |           "enrollment"            | "discount"                      |
|---------------------------------------------------------------------------------------------|
| url                   |           string (URL)            |  Visit CTA target               |
|---------------------------------------------------------------------------------------------|
| starts_at             |        string (YYYY-MM-DD)        |  Optional; shown as date        |
|---------------------------------------------------------------------------------------------|
| ends_at               |        string (YYYY-MM-DD)        |  Optional; used as default deadline |
|---------------------------------------------------------------------------------------------|
| discount_pct          |           number or null          |  For discounts                  |
|---------------------------------------------------------------------------------------------|
| price_original        |           number or null          |  For discounts                  |
|---------------------------------------------------------------------------------------------|
| price_current         |           number or null          |  For discounts                  |
|---------------------------------------------------------------------------------------------|
| tags                  |              string[]             |  Used in chips and search       |
|---------------------------------------------------------------------------------------------|

## How to update content
================================================================================

- Open /public/announcements.json.
- Add/edit/remove items (keep the schema).
- Save. In dev, the cache-buster (?ts=) ensures you see updates immediately.
 In prod, most CDNs will pick this up on the next deploy.

## Error handling & states
================================================================================

- Loading: “Loading announcements…” while fetching.
- Error: A concise error message at the top of the section.
- Empty: “No announcements match your filters.” if nothing passes the filters.

## Why this is safe to ship now
================================================================================

- No server required.
- Clear, typed-ish schema that the rest of the UI can rely on.
- The “Save as Goal” path is already integrated with your Goals store and modal UX.
- Easy to evolve: swapping the data source won’t break the UI.

## Future improvements (when you’re ready for live data)
================================================================================

### A) Backend endpoint (recommended)

1. Add an API route like GET /api/announcements/ in your Django app.
    - Source data could be scraped, synced from providers, or hand-curated in the admin.
    - Consider a small DB table with this exact schema (plus a source and last_updated).

2. Caching: send ETag/Last-Modified; on the client, change fetchAnnouncements() to:

                export async function fetchAnnouncements() {
                const res = await api.get("/api/announcements/");
                return normalize(res.data);
                }

3. Auth (optional): keep it public or auth-gate it if you plan to show personalized deals.
4. Scheduler: run a nightly job to refresh live feeds (Celery/CRON).
5. Analytics: log click-throughs to understand interest.

### B) External JSON package (quick intermediary)

- Host the same JSON on a separate repo or CDN (e.g., GitHub Pages).
- Point fetchAnnouncements() to that URL.
- Pros: no backend. Cons: still manual, less control/observability.

### C) Schema & DX

- Add a version field to the JSON and validate on the client.
- Create a TypeScript interface (even if the app is JS) for editor intellisense and safer refactors.
- Write a tiny schema validator (Zod/Yup) to catch bad data early.

### D) UI polish

- Add sorting (by start date, end date, discount amount).
- Add a “Only active” toggle (e.g., Date.now() within [starts_at, ends_at]).
-Add “Save for later” and show it in Dashboard.

## Quick QA checklist
================================================================================

- JSON validates (trailing commas and quotes are correct).
- Cards render in Home and clicking Visit opens in a new tab.
- Save as Goal opens the modal with a prefilled title and deadline.
- Submitting the Goal creates it and closes the modal.
- Search & filters behave as expected (case-insensitive, tags included).
- Dark/light theme looks good for badges and chips.

## Maintenance tips
================================================================================

- Keep id values stable—they’re used as React keys.
- Prefer ISO dates (YYYY-MM-DD) for predictable parsing.
- If you add new fields, default them in the normalizer so UI doesn’t crash on missing data.
