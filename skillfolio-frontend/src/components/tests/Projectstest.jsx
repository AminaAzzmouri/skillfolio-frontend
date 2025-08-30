import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

// --- Mock children kept minimal so we can focus on ProjectsPage logic ---
vi.mock("../components/SearchBar", () => ({
  default: ({ value = "", onChange = () => {} }) => (
    <div data-testid="SearchBar">
      <input
        aria-label="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  ),
}));
vi.mock("../components/Filters", () => ({
  default: ({ type, value, onChange = () => {}, certificates = [] }) => (
    <div data-testid={`Filters-${type}`}>
      <button onClick={() => onChange(value)}>apply-filters</button>
      <div data-testid="cert-count">{certificates.length}</div>
    </div>
  ),
}));
vi.mock("../components/SortSelect", () => ({
  default: ({ value = "", onChange = () => {} }) => (
    <select
      aria-label="sort"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      data-testid="SortSelect"
    >
      <option value="">Sort…</option>
      <option value="title">Title</option>
    </select>
  ),
}));
vi.mock("../components/Pagination", () => ({
  default: ({ page = 1, onPageChange = () => {} }) => (
    <div data-testid="Pagination">
      <button onClick={() => onPageChange(page + 1)}>next</button>
    </div>
  ),
}));
vi.mock("../components/ConfirmDialog", () => ({
  default: () => <div data-testid="ConfirmDialog" />,
}));
vi.mock("../components/Modal", () => ({
  default: ({ open, children }) =>
    open ? <div data-testid="Modal">{children}</div> : null,
}));
vi.mock("../components/forms/ProjectForm", () => ({
  default: ({ initial }) => (
    <div data-testid="ProjectForm">{initial ? "edit" : "create"}</div>
  ),
}));

// --- Mock the Zustand store hook with a mutable state helper ---
let state;
const makeFns = () => ({
  fetchProjects: vi.fn(),
  createProject: vi.fn(),
  updateProject: vi.fn(),
  deleteProject: vi.fn(),
  fetchCertificates: vi.fn(),
});
vi.mock("../store/useAppStore", () => {
  state = {
    // projects slice
    projects: [],
    projectsLoading: false,
    projectsError: "",
    projectsMeta: { count: 0 },
    // certs slice
    certificates: [],
    certificatesLoading: false,
    certificatesError: "",
    // actions
    ...makeFns(),
  };
  const useAppStore = (selector) => selector(state);
  useAppStore.setState = (patch) => Object.assign(state, patch);
  return { useAppStore };
});

import ProjectsPage from "../pages/Projects.jsx";
import { useAppStore } from "../store/useAppStore";

describe("ProjectsPage", () => {
  beforeEach(() => {
    // reset state + spies before each test
    const fns = makeFns();
    state.projects = [];
    state.projectsLoading = false;
    state.projectsError = "";
    state.projectsMeta = { count: 0 };
    state.certificates = [];
    state.certificatesLoading = false;
    state.certificatesError = "";
    Object.assign(state, fns);
  });

  const renderPage = (route = "/projects") =>
    render(
      <MemoryRouter initialEntries={[route]}>
        <ProjectsPage />
      </MemoryRouter>
    );

  it("calls fetchCertificates and fetchProjects on mount", () => {
    useAppStore.setState({
      certificates: [{ id: 1, title: "Cert A" }],
      projects: [],
    });

    renderPage();

    expect(state.fetchCertificates).toHaveBeenCalledTimes(1);
    expect(state.fetchProjects).toHaveBeenCalledTimes(1);

    // Ensure fetchProjects received a params object
    const arg = state.fetchProjects.mock.calls[0][0];
    expect(arg).toEqual(
      expect.objectContaining({
        search: "",
        ordering: "",
        page: 1,
        filters: expect.objectContaining({
          certificate: "",
          status: "",
        }),
      })
    );
  });

  it("renders projects grid and shows linked certificate title & link", () => {
    useAppStore.setState({
      certificates: [{ id: 1, title: "Cert A" }],
      projects: [
        {
          id: 1,
          title: "Linked Project",
          description: "desc",
          status: "planned",
          date_created: "2025-01-01",
          certificate: 1,
        },
        {
          id: 2,
          title: "Solo Project",
          description: "desc2",
          status: "planned",
          date_created: "2025-01-02",
          certificate: null,
        },
      ],
      projectsMeta: { count: 2 },
    });

    renderPage();

    expect(screen.getByText("Linked Project")).toBeInTheDocument();
    expect(screen.getByText("Solo Project")).toBeInTheDocument();

    // Linked footer text
    expect(screen.getByText(/Linked to: Cert A/i)).toBeInTheDocument();

    // Footer link goes to certificates with id param
    const link = screen.getByRole("link", { name: /View certificate/i });
    expect(link).toHaveAttribute("href", "/certificates?id=1");
  });

  it("enters edit mode when Edit is clicked and shows ProjectForm", () => {
    useAppStore.setState({
      certificates: [],
      projects: [
        {
          id: 42,
          title: "Edit Me",
          description: "x",
          status: "planned",
          date_created: "2025-01-01",
          certificate: null,
        },
      ],
    });

    renderPage();

    fireEvent.click(screen.getByRole("button", { name: /Edit/i }));
    expect(screen.getByTestId("ProjectForm")).toHaveTextContent("edit");
  });

  it("shows loading and empty states", () => {
    // loading
    useAppStore.setState({ projectsLoading: true, projects: [] });
    renderPage("/projects?search=&page=1");
    expect(screen.getByText(/Loading projects/i)).toBeInTheDocument();

    // empty (rerender with not loading)
    useAppStore.setState({ projectsLoading: false, projects: [] });
    renderPage("/projects?search=&page=1");
    expect(screen.getByText(/No projects yet/i)).toBeInTheDocument();
  });
});
