## Purpose:
================================================================================

A lightweight, accessible progress indicator used across pages (e.g., Goals, Dashboard) to visualize a percentage from 0–100 with an optional text label.

## Props:
================================================================================

- value: number — current progress. Clamped to [0, 100] and coerced via Number(value) || 0.
- label?: string — optional caption shown above the bar (e.g., “Checklist progress”).

## Behavior & Rendering:
================================================================================

- pComputes pct = clamp(Number(value) || 0, 0, 100).
- Renders:
    > Optional label (small text).
    > A container track with role="progressbar" and ARIA attributes:
        * aria-valuemin={0}, aria-valuemax={100}, aria-valuenow={pct}.
    > A fill div with inline style={{ width: \${pct}%` }}andaria-hidden="true"`.
    > A numeric % readout below (e.g., 42%).
- Styling uses Tailwind tokens:
    > Track: h-3 w-full rounded bg-gray-800 overflow-hidden
    > Fill: h-full bg-primary

## Accessibility:
================================================================================

- Uses WAI-ARIA progressbar semantics so assistive tech can announce state.
- aria-valuenow reflects the clamped percentage.
- The separate textual % readout improves comprehension for low-vision users.
- If the context requires more description (e.g., what is progressing), provide it via the label prop; screen readers will read the DOM text near the progressbar.


## Usage
================================================================================

  // Basic
    <ProgressBar value={67} />

    // With label
    <ProgressBar value={goal.steps_progress_percent} label="Checklist progress" />

    // Defensive usage if source may be null/undefined
    <ProgressBar value={Number(summary?.projects_percent) || 0} label="Projects done" />

## Integration Notes:
================================================================================

- Safe to pass any numeric-like value; the component will coerce and clamp.
- For asynchronous states, pair with a loading indicator if needed; ProgressBar itself doesn’t handle loading skeletons.
- If you show multiple bars in a list, prefer concise labels to avoid visual noise.

## Edge Cases:
================================================================================

-Non-numeric value → coerced to 0%.
- Values < 0 → clamped to 0%; values > 100 → clamped to 100%.
- Long labels wrap naturally; keep them brief for readability.

## Future Enhancements:
================================================================================

- tOptional inline percentage inside the bar when space allows.
- Color thresholds (e.g., red/yellow/green) via an optional tone prop.
- Animated transitions for smoother updates.
- aria-label prop to provide an explicit accessible name without visual label

## Test ideas (optional):
================================================================================

- Renders with default 0% when value missing/NaN.
- Clamps value < 0 to 0 and > 100 to 100.
- Reflects clamped value in both the width style and the % text.
- Sets role="progressbar" and correct aria-valuemin/max/now.
- Shows label text when provided.




