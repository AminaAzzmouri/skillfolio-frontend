## `daysUntil(dateString: "YYYY-MM-DD"): number`
=================================================================================================================================================

Returns the whole‐day distance from **today** to the target date.
> Positive → target date is in the **future**
>  `0` → **today**
> - Negative → target date is in the **past**

## Behavior
=================================================================================================================================================

- Accepts a simple ISO date string (no time): `"YYYY-MM-DD"`.
- Normalizes both **today** and the **target** to midnight (local time) before subtracting, so time-of-day and DST won’t skew results.
- Invalid or empty input returns `0`.

## Examples
=================================================================================================================================================

daysUntil("2030-01-01")  // e.g. 1826
daysUntil("1970-01-01")  // negative number
daysUntil("not-a-date")  // 0
daysUntil("")            // 0

## Notes
=================================================================================================================================================

- Uses the browser’s local timezone.
- If you need a strict UTC calculation, adapt the implementation to construct dates with Date.UTC(...).
