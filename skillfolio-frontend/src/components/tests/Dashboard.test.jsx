import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";

// ---------- hoisted shared fns/state ----------
const h = vi.hoisted(() => {
  const apiGet = vi.fn();

  const fetchCertificates = vi.fn();
  const fetchProjects = vi.fn();
  const fetchGoals = vi.fn();

  const storeState = {
    // lists
    certificates: [{ id: 1, title: "Cert A", issuer: "OrgX", date_earned: "2024-01-01", file_upload: null }],
    projects: [{ id: 10, title: "Proj 1", status: "planned", description: "desc 1" }],
    goals: [{ id: 99, title: "Goal 1", target_projects: 3, deadline: "2025-01-01", steps_progress_percent: 20 }],

    // flags
    certificatesLoading: false,
    certificatesError: "",
    projectsLoading: false,
    projectsError: "",
    goalsLoading: false,
    goalsError: "",

    // actions
    fetchCertificates,
    fetchProjects,
    fetchGoals,
  };

  return { apiGet, fetchCertificates, fetchProjects, fetchGoals, storeState };
});

// ---------- mocks ----------

// no-op framer-motion so animations don’t affect DOM assertions
vi.mock("framer-motion", () => {
  const Noop = React.forwardRef(({ children, ...rest }, ref) => (
    <div ref={ref} {...rest}>
      {children}
    </div>
  ));
  return {
    motion: new Proxy({}, { get: () => Noop }),
    AnimatePresence: ({ children }) => <>{children}</>,
  };
});

// IMPORTANT: mock with the SAME specifier your Dashboard uses after Vite resolves.
// "@/lib/api" → /src/lib/api; "../lib/api" also resolves to that, so alias is fine.
vi.mock("@/lib/api", () => ({
  api: { get: h.apiGet },
}));

vi.mock("@/store/useAppStore", () => {
  const useAppStore = (selector) => (selector ? selector(h.storeState) : h.storeState);
  useAppStore.getState = () => h.storeState;
  return { useAppStore };
});

// ---------- SUT ----------
import Dashboard from "@/pages/Dashboard.jsx";

function renderDash() {
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();

  // default: analytics succeed
  h.apiGet.mockImplementation((url) => {
    if (url.includes("/api/analytics/summary/")) {
      return Promise.resolve({ data: { certificates_count: 2, projects_count: 3 } });
    }
    if (url.includes("/api/analytics/goals-progress/")) {
      return Promise.resolve({ data: [{ steps_progress_percent: 50 }, { progress_percent: 100 }] });
    }
    return Promise.resolve({ data: {} });
  });
});

describe("Dashboard", () => {
  it("renders header, calls fetch actions, and shows analytics counts & recent items", async () => {
    renderDash();

    // store actions called on mount
    await waitFor(() => {
      expect(h.fetchCertificates).toHaveBeenCalledTimes(1);
      expect(h.fetchProjects).toHaveBeenCalledTimes(1);
      expect(h.fetchGoals).toHaveBeenCalledTimes(1);
    });

    // header
    expect(screen.getByText(/Welcome to Your Dashboard/i)).toBeInTheDocument();

    // analytics cards show counts after api resolves
    await waitFor(() => {
      expect(screen.getByText("Total Certificates")).toBeInTheDocument();
      expect(screen.getByText("Total Projects")).toBeInTheDocument();
      expect(screen.getByText("Goal Progress")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument(); // certificates_count
      expect(screen.getByText("3")).toBeInTheDocument(); // projects_count
    });

    // recent items present from mocked store
    expect(screen.getByText("Cert A")).toBeInTheDocument();
    expect(screen.getByText("Proj 1")).toBeInTheDocument();
    expect(screen.getByText("Goal 1")).toBeInTheDocument();

    // "View all" links
    const viewAll = screen.getAllByRole("link", { name: /View all/i });
    expect(viewAll).toHaveLength(3);
    expect(viewAll[0]).toHaveAttribute("href", "/certificates");
    expect(viewAll[1]).toHaveAttribute("href", "/projects");
    expect(viewAll[2]).toHaveAttribute("href", "/goals");
  });

  it("shows an error UI when analytics summary fails", async () => {
    // Fail only the summary endpoint (the component also toasts this)
    h.apiGet.mockImplementation((url) => {
      if (url.includes("/api/analytics/summary/")) {
        return Promise.reject({ response: { data: { detail: "Boom" } } });
      }
      if (url.includes("/api/analytics/goals-progress/")) {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: {} });
    });

    const { container } = renderDash();

    // wait until the summary request has been attempted
    await waitFor(() =>
      expect(h.apiGet).toHaveBeenCalledWith(expect.stringContaining("/api/analytics/summary/"))
    );

    // The KPI cards render <EmptyState isError>, which adds "text-accent".
    // Assert that at least one error-styled element appears.
    await waitFor(() => {
      const errorEls = container.querySelectorAll(".text-accent");
      expect(errorEls.length).toBeGreaterThan(0);
    });
  });
});
