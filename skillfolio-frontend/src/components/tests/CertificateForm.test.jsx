// src/components/tests/CertificateForm.test.jsx

import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Import the component under test (relative path from /src/components/tests)
import CertificateForm from "../forms/CertificateForm.jsx";

// --- Mock the store (create mode path uses this) ---
const createMock = vi.fn();
vi.mock("../../store/useAppStore", () => ({
  useAppStore: (selector) =>
    selector({
      createCertificate: createMock,
    }),
}));

describe("CertificateForm", () => {
  beforeEach(() => {
    createMock.mockReset();
  });

  it("create mode: validates required fields, submits, resets, and calls onSuccess", async () => {
    const onSuccess = vi.fn();

    render(<CertificateForm onSuccess={onSuccess} />);

    const title = screen.getByLabelText(/title/i);
    const issuer = screen.getByLabelText(/issuer/i);
    const date = screen.getByLabelText(/date earned/i);
    const submit = screen.getByRole("button", { name: /add certificate/i });

    // Initially disabled until fields provided
    expect(submit).toBeDisabled();

    fireEvent.change(title, { target: { value: "Google Data Analytics" } });
    fireEvent.change(issuer, { target: { value: "Coursera" } });
    fireEvent.change(date, { target: { value: "2024-05-01" } });

    expect(submit).not.toBeDisabled();

    createMock.mockResolvedValueOnce({});

    fireEvent.click(submit);

    // Wait for async submit to finish
    await waitFor(() => {
      expect(createMock).toHaveBeenCalledWith({
        title: "Google Data Analytics",
        issuer: "Coursera",
        date_earned: "2024-05-01",
        file: null,
      });
      expect(onSuccess).toHaveBeenCalled();
    });

    // Form reset after successful create
    expect(title).toHaveValue("");
    expect(issuer).toHaveValue("");
    expect(date).toHaveValue("");
  });

  it("edit mode: uses onSubmit path, shows 'Save changes', and calls onSuccess", async () => {
    const onSubmit = vi.fn().mockResolvedValue({});
    const onSuccess = vi.fn();

    const initial = {
      id: 7,
      title: "Old Title",
      issuer: "Old Issuer",
      date_earned: "2023-01-01",
    };

    render(
      <CertificateForm
        initial={initial}
        onSubmit={onSubmit}
        submitLabel="Save changes"
        onSuccess={onSuccess}
      />
    );

    // Button label reflects edit mode
    const submit = screen.getByRole("button", { name: /save changes/i });

    // Change fields
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: "New Title" },
    });
    fireEvent.change(screen.getByLabelText(/issuer/i), {
      target: { value: "New Issuer" },
    });
    fireEvent.change(screen.getByLabelText(/date earned/i), {
      target: { value: "2024-02-02" },
    });

    fireEvent.click(submit);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        title: "New Title",
        issuer: "New Issuer",
        date_earned: "2024-02-02",
        file: null,
      });
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it("reset returns to initial values in edit mode", async () => {
    const initial = {
      id: 9,
      title: "Keep This",
      issuer: "Stay",
      date_earned: "2024-01-15",
    };

    render(<CertificateForm initial={initial} submitLabel="Save changes" />);

    const title = screen.getByLabelText(/title/i);
    const resetBtn = screen.getByRole("button", { name: /reset/i });

    // mutate then reset
    fireEvent.change(title, { target: { value: "Temp" } });
    expect(title).toHaveValue("Temp");

    fireEvent.click(resetBtn);
    expect(title).toHaveValue("Keep This");
  });

  it("create mode: surfaces server error and re-enables submit", async () => {
    const onSuccess = vi.fn();

    render(<CertificateForm onSuccess={onSuccess} />);

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: "X" } });
    fireEvent.change(screen.getByLabelText(/issuer/i), { target: { value: "Y" } });
    fireEvent.change(screen.getByLabelText(/date earned/i), { target: { value: "2024-05-01" } });

    // Simulate backend error
    createMock.mockRejectedValueOnce({
      response: { data: { detail: "Server exploded" } },
    });

    const submit = screen.getByRole("button", { name: /add certificate/i });
    fireEvent.click(submit);

    // Error appears and onSuccess NOT called
    expect(await screen.findByText(/server exploded/i)).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();

    // Button becomes enabled again after failure
    expect(submit).not.toBeDisabled();
  });

  it("create mode: includes selected file in payload", async () => {
    const onSuccess = vi.fn();

    render(<CertificateForm onSuccess={onSuccess} />);

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: "Cert" } });
    fireEvent.change(screen.getByLabelText(/issuer/i), { target: { value: "Org" } });
    fireEvent.change(screen.getByLabelText(/date earned/i), {
      target: { value: "2024-05-02" } }
    );

    const file = new File(["dummy"], "proof.pdf", { type: "application/pdf" });
    const fileInput = screen.getByLabelText(/upload file/i);
    fireEvent.change(fileInput, { target: { files: [file] } });

    createMock.mockResolvedValueOnce({});

    fireEvent.click(screen.getByRole("button", { name: /add certificate/i }));

    await waitFor(() => {
      expect(createMock).toHaveBeenCalledTimes(1);
      const arg = createMock.mock.calls[0][0];
      expect(arg.file).toBeInstanceOf(File);
      expect(arg.file.name).toBe("proof.pdf");
    });
  });
});
