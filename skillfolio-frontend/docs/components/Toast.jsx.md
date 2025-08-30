**Dashboard.jsx**:

## Purpose:
===============================================================================

- Lightweight toast/notification container with auto-hide and enter/exit animations (Framer Motion). Designed for non-blocking feedback (e.g., step errors, analytics fetch errors).

## Usage:
===============================================================================

- Parent owns the list of toasts:

        const [toasts, setToasts] = useState([]);
        const pushToast = (type, message) =>
        setToasts((t) => [...t, { id: crypto.randomUUID(), type, message }]);
        const dismissToast = (id) =>
        setToasts((t) => t.filter((x) => x.id !== id));

        <ToastContainer toasts={toasts} onDismiss={dismissToast} />

## Props:
===============================================================================

- toasts: { id: string; type: "error" | "info" | "success"; message: string }[]
- onDismiss(id: string) — remove a toast
- autoHideMs? — milliseconds before auto-dismiss (default 3500)

## Behavior:
===============================================================================

- Auto-hide: each toast gets a timer; cleared on unmount
- Animations: spring in/out with slight scale and vertical motion
- Theming:
      • error → accent border/background + ⚠️
      • success → green tones + ✅
      • info (default) → neutral background + ℹ️
- Manual dismiss: “✕” button on each toast

## Accessibility:
===============================================================================

- Short, textual messages. For critical alerts, consider adding:
      • role="status" or role="alert" on the container
      • aria-live="polite" (status) or aria-live="assertive" (alert)

- (The current implementation doesn’t set ARIA roles; add them if your audits require.)

## Tips:
===============================================================================

- Keep messages brief (one sentence).
- Avoid stacking dozens of toasts—dismiss older ones or dedupe.
- Use toasts for outcomes (success/error/info); use inline errors for form validation.
