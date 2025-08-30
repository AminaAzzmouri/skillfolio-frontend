import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import CertificatesPage from "@/pages/Certificates.jsx";
import { useAppStore } from "@/store/useAppStore";
import { api } from "@/lib/api";

function renderPage() {
  return render(
    <MemoryRouter>
      <CertificatesPage />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.restoreAllMocks();

  // Safe stub for the project-count lookups the page does via api.get
  vi.spyOn(api, "get").mockResolvedValue({ data: { results: [] } });

  // Seed the store with a clean baseline; replace=true to avoid stale keys
  useAppStore.setState(
    {
      certificates: [],
      certificatesLoading: false,
      certificatesError: "",
      certificatesMeta: { count: 0 },

      fetchCertificates: vi.fn(),
      updateCertificate: vi.fn(),
      deleteCertificate: vi.fn(),
    },
    true
  );
});

describe("Certificates page", () => {
  it("renders header and empty state, and triggers initial fetch with expected params", () => {
    renderPage();

    expect(screen.getByText("Certificates")).toBeInTheDocument();
    expect(screen.getByText("No certificates yet.")).toBeInTheDocument();

    const fetchSpy = useAppStore.getState().fetchCertificates;
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const args = fetchSpy.mock.calls[0][0];
    expect(args).toMatchObject({
      search: "",
      ordering: "",
      page: 1,
      filters: { issuer: "", date_earned: "", id: "" },
    });
  });

  it("shows a certificate card and toggles edit mode (renders real form)", () => {
    useAppStore.setState({
      certificates: [
        {
          id: 1,
          title: "Cert A",
          issuer: "Acme",
          date_earned: "2024-01-01",
          project_count: 2,
          file_upload: "",
        },
      ],
    });

    renderPage();

    expect(screen.getByText("Cert A")).toBeInTheDocument();

    // Enter edit mode
    fireEvent.click(screen.getByRole("button", { name: /edit/i }));

    // Real CertificateForm appears in edit mode with "Save changes"
    expect(
      screen.getByRole("button", { name: /save changes/i })
    ).toBeInTheDocument();
  });

  it("opens create modal and shows the real form inside the dialog", async () => {
    renderPage();

    // Click the top "Add Certificate" button (opens modal)
    fireEvent.click(screen.getByRole("button", { name: /add certificate/i }));

    // Grab the dialog node itself
    const dialog = await screen.findByRole("dialog");

    // Assert the modal heading (prevents confusion with the outer button text)
    expect(
      within(dialog).getByRole("heading", { name: /add certificate/i })
    ).toBeInTheDocument();

    // And the submit button inside the modal form (create mode)
    expect(
      within(dialog).getByRole("button", { name: /add certificate/i })
    ).toBeInTheDocument();
  });
});
