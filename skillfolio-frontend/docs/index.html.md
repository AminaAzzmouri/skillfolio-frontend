**index.html**:

  ## Purpose:
  ================================================================================

  This is the **root HTML file** for the Skillfolio frontend.  
  It serves as the single entry point for the React application when bundled by Vite.  

  React will **mount the app** inside the `<div id="root"></div>` element.  
  All further UI rendering is handled dynamically by React components.

  ================================================================================

  ## Structure:
  ================================================================================

  - <!doctype html>: Declares the HTML5 standard.  
  - <html lang="en">: Base HTML tag with language set to English.  
  - <head>: Contains metadata and external resources.  
      • <meta charset="UTF-8"> → Ensures proper text encoding.  
      • <meta name="viewport" ...> → Makes layout responsive on mobile devices.  
      • <link rel="icon" ...> → Sets the favicon (vite.svg by default).  
      • <title>Skillfolio</title> → Page title shown in browser tabs.  
      • <link href="https://fonts.googleapis.com/..."> → Loads Google Fonts (Roboto + Roboto Mono).  

  - <body>: Contains the **root mount point** (`<div id="root"></div>`)  
    where React will inject the app.  
    Loads the compiled JavaScript (`src/main.jsx`) as the entry module.  

  ================================================================================

  ## Role in Project:
  ================================================================================

  - Acts as the **shell container** for the React app.  
  - Provides global resources (fonts, favicon, metadata).  
  - Ensures responsiveness with viewport meta.  
  - Delegates all app rendering to React once JS is loaded.  

  ================================================================================

  ## Future Enhancements:
  ================================================================================

  - Replace default Vite favicon with Skillfolio's branding icon.  
  - Add SEO-related meta tags (description, keywords, Open Graph).  
  - Add dark/light mode theme metadata for better UX.  
  - Include analytics scripts or PWA support if needed.  