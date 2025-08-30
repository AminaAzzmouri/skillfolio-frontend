## Purpose:
===============================================================================

The **Home** page is the first screen for authenticated users. It gives a warm welcome, offers quick actions (projects/goals/certificates), surfaces rotating “Did you know?” facts, and shows the **Announcements** feed where users can save an enrollment/discount as a prefilled **Goal**.

## Structure:
===============================================================================

- **Top “Motivation” card** (left, animated via `framer-motion`)
          • Greeting with the user’s name (from `useAppStore().user`)
          • Three action buttons: **Add a Project**, **Set a Goal**, **Archive a Certificate**

- **“Did you know?” aside** (right, animated)

          • Rotating fact (see _Facts_ below) with source link
              > “New fact” button and a link to **/dashboard**

          • **“Hold on to your dreams”** section (full width)
              > Short encouragement and three links for common next steps

          • **AnnouncementsSection**
              > Fetched client-side from `/public/announcements.json`
              > Each announcement has a **Save as Goal** action that triggers a modal

          • **Save as Goal Modal**
              > Opens `GoalForm` in **create** mode, **prefilled** via `initialDraft`
              > On submit, calls `createGoal()` from the store, then closes

          • **Save as Goal Modal**
              > Opens `GoalForm` in **create** mode, **prefilled** via `initialDraft`

## State & Behavior
===============================================================================

- **Facts rotation**
  • Picks a stable daily index (based on date) with `useDailyIndex`
  • Auto-cycles every **12s** via `setInterval`; “New fact” advances manually

- **Save as Goal flow**

  • `onSaveGoalRequest(ann)` → sets `goalDraft`:
      > `title: "Enroll in: <announcement.title>"`
      > `target_projects: 1`
      > `deadline: announcement.ends_at`

  • Opens modal; `GoalForm` uses `initialDraft`
  • `handleCreateGoal(payload)` → `await createGoal(payload)` → close modal

- **User greeting**

  • Displays `first_name`, else `username`, else `email`, fallback `"there"`

## Data:
===============================================================================

- Reads `user` and `createGoal` from **Zustand** store (`useAppStore`).
- **No direct API calls** here. The announcements are loaded inside `AnnouncementsSection` via a simple fetch of `/announcements.json`.

## Routing:
===============================================================================

- Uses `<Link>` buttons to **/projects**, **/goals**, **/certificates**, **/dashboard**.
- Assumes this page is behind your app’s `ProtectedRoute` (authenticated only)

## Role in Project:
===============================================================================

- Gentle “hub” before the dashboard: motivates, suggests next actions, and converts external learning opportunities (announcements) into **actionable goals**.

## Future Enhancements:
===============================================================================

- Personalize fact topics based on recent activity.
- Show a “recent activity” strip (latest project/certificate).
- Add skeletons/shimmers for the announcements section.
