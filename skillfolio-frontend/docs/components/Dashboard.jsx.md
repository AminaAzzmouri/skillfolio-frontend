**Dashboard.jsx**:

  ## Purpose:
  ================================================================================

  This component serves as the **main authenticated area** of the Skillfolio app. 
  Once logged in, users land here to view their overall progress, achievements, and 
  quick access to certificates, projects, and profile-related features.

  ================================================================================

  ## Structure:
  ================================================================================

  Layout:
    - **Sidebar (left side)**: 
        • Navigation links → Certificates, Projects, Profile
        • Visible on medium screens and above (hidden on small screens).
    
    - **Main content (right side)**:
        • Welcome header
        • Statistics section:
            → Displays total certificates (from store)
            → Displays total projects (from store)
            → Displays goal progress (static placeholder for now, dynamic later)
        • Recent Certificates section:
            → Shows the most recently added certificates (from mock store state).

  Styling:
    - Uses Tailwind’s custom theme (dark background, light text).
    - Grid layout for statistics (responsive for small/large screens).
    - Rounded cards with subtle background for UI clarity.

  ================================================================================

  ## State Management:
  ================================================================================

  - Pulls data directly from the global Zustand store (`useAppStore`).
    → certificates: Array of certificates with { title, id }
    → projects: Array of projects with { title, id }
  - Dynamic counts (certificates.length, projects.length) update instantly 
    as new data is added via store actions.

  ================================================================================

  ## Routing:
  ================================================================================

  - Uses React Router’s <Link> for client-side navigation.
    → “Certificates” → /certificates
    → “Projects”    → /projects
    → “Profile”     → reserved for future profile page

  ================================================================================

  ## Role in Project:
  ================================================================================

  The dashboard is the **central hub** for the user’s learning journey. 
  It consolidates certificate tracking, project management, and goal progress 
  into one interface, allowing users to quickly gauge their skill-building activity.

  ================================================================================

  ## Future Enhancements:
  ================================================================================

  - Add chart visualizations for project/certificate progress.
  - Implement goal progress calculation (link with backend).
  - Mobile sidebar (hamburger menu toggle).
  - Certificates and projects lists → clickable, leading to detailed views.