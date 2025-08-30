## Purpose
================================================================================

Switch between light/dark themes by toggling the dark class on <html> and persisting the choice in localStorage under sf-theme.

## Props
================================================================================

- className: string — Extra classes for the button.

## Behavior
================================================================================

- Initial state reads document.documentElement.classList.contains("dark").
- Toggling writes sf-theme = "dark" | "light" and updates the <html> class list.
- Button text/emoji reflects the current theme (☀️ for light, 🌙 for dark).

## Accessibility
================================================================================

- Provides aria-label="Toggle theme" and a contextual title (e.g., “Switch to light mode”).

## Usage
================================================================================

<ThemeToggle className="ml-2" />

## Integration Notes
================================================================================

- To avoid a “flash” of wrong theme on first paint, initialize the theme before React mounts (e.g., in your HTML template or app bootstrap):
        <script>
        try {
            const saved = localStorage.getItem('sf-theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const isDark = saved ? saved === 'dark' : prefersDark;
            document.documentElement.classList.toggle('dark', isDark);
        } catch (e) {}
        </script>

## Future Enhancements
================================================================================

- Sync to prefers-color-scheme changes at runtime.
- Provide a tri-state: system | light | dark