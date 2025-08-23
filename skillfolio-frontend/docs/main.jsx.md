**main.jsx**

  ## Purpose:
  ================================================================================

  This is the **entry point** of the Skillfolio React application.  
  It bootstraps the entire frontend by rendering the <App /> component 
  into the root HTML element defined in `public/index.html`.  

  ================================================================================

  ## Structure:
  ================================================================================

  #### React StrictMode:
    • Wraps the app to help catch potential bugs, deprecated APIs, 
      and unintended side effects during development.

  #### BrowserRouter:
    • Provides React Router’s client-side routing functionality.  
    • Ensures that navigation between pages (e.g., /, /login, /dashboard) 
      works without full page reloads.  
    • Makes <Routes> and <Link> inside App.jsx functional.

  #### App Component:
    • The core container that holds the Navbar and all routes.  
    • Imported from ./App.jsx and rendered as the main application tree.

  #### CSS Import:
    • Imports index.css which applies Tailwind’s base, components, and utilities 
      to the app globally.

  ================================================================================

  ## Role in Project:
  ================================================================================

  - Acts as the **starting point** where the React app mounts to the DOM.  
  - Establishes global providers such as React Router.  
  - Serves as the glue between the root HTML (`<div id="root">`) and 
    the actual React components.

  ================================================================================

  ## Future Enhancements:
  ================================================================================

  - Add global state providers here (e.g., Zustand persist middleware, context).  
  - Integrate a ThemeProvider or internationalization provider if needed.  
  - Potentially configure error boundaries or suspense loaders for smoother UX.  