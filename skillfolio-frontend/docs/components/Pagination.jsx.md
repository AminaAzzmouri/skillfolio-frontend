## Purpose:
================================================================================

A tiny, controlled pagination widget that renders Prev / “Page X of Y” / Next.
Parents own the current page and update it via onPageChange.

## Props:
================================================================================

- page (number, default 1)
Current 1-based page index (controlled by parent).

- pageSize (number, default 10) 
Items per page (used to compute total pages).

- total (number, default 0)
Total item count across all pages.

- onPageChange (function)
Called with the next page number when the user clicks Prev/Next.

- loading (boolean, default false)
 Disables controls while data is loading

## Derived state & clamping
================================================================================

- pageCount = Math.max(1, Math.ceil(total / pageSize))
- p = clamp(Number(page) || 1, 1, pageCount)
- Buttons are disabled if loading is true or moving would go out of range:
    • Prev disabled when p <= 1
    • Next disabled when p >= pageCount

## Behavior:
================================================================================

- Clicking Prev calls onPageChange(p - 1) (if enabled).
- Clicking Next calls onPageChange(p + 1) (if enabled).
- If the parent passes an out-of-range page, the component displays the clamped value p, so the UI never shows invalid pages.

## Usage pattern (with URL search params):
================================================================================

  // Example parent usage
    const [sp, setSp] = useSearchParams();
    const page = Number(sp.get("page") || 1);

    <Pagination
    page={page}
    pageSize={10}
    total={meta?.count || 0}
    loading={loading}
    onPageChange={(n) => {
        const next = new URLSearchParams(sp);
        next.set("page", String(n));
        setSp(next);
    }}
    />

## Accessibility & UX:
================================================================================

- Buttons are standard <button> elements (keyboard-accessible by default).
- States are communicated via disabled and visible text “Page X of Y”.
- Recommended enhancement (optional): add aria-label="Previous page" / "Next page" to the buttons if you want explicit announcements for screen readers.

## Styling:
================================================================================

-Tailwind classes for a compact control row:
    > Container: flex items-center gap-2 text-sm
    > Buttons: bordered, hover state, and disabled:opacity-50.

## Edge cases:
================================================================================

- total = 0 → pageCount becomes 1; both buttons disabled.
- If the backend reduces total so current page is now too high, the component displays the clamped page; parent should still update the real page state on next interaction.

## Integration notes:
================================================================================

- Use the same pageSize in both FE and BE to keep counts consistent.
- When filters/search change, reset the query param page to 1 to avoid empty pages.
- Pass the store’s loading flag so users can’t double-click through while a fetch is in flight.

## Test ideas (optional):
================================================================================

- Renders “Page X of Y” with correct math.
- Prev disabled on first page; Next disabled on last page.
- Clicking Prev/Next calls onPageChange with expected values when enabled.
- Buttons disabled when loading = true.




