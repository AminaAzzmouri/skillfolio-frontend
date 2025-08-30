import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Register from "@/pages/Register.jsx";

// Mocks
const mockRegister = vi.fn();
const mockNavigate = vi.fn();

vi.mock("@/store/useAppStore", () => {
  return {
    useAppStore: (selector) =>
      selector({
        register: mockRegister,
        // anything else your selectors might pull in future
      }),
  };
});

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function setup() {
  render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  );
}

beforeEach(() => {
  mockRegister.mockReset();
  mockNavigate.mockReset();
});

describe("Register page", () => {
  it("renders basic fields and button", () => {
    setup();
    expect(
      screen.getByRole("heading", { name: /create your skillfolio account/i })
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/you@example\.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/create a password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/re-enter your password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
  });

  it("shows mismatch error and does not call register()", async () => {
    setup();
    fireEvent.change(screen.getByPlaceholderText(/you@example\.com/i), {
      target: { value: "me@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/create a password/i), {
      target: { value: "abc12345" },
    });
    fireEvent.change(screen.getByPlaceholderText(/re-enter your password/i), {
      target: { value: "different" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("calls register() and navigates to /login on success", async () => {
    mockRegister.mockResolvedValueOnce({}); // success
    setup();

    fireEvent.change(screen.getByPlaceholderText(/you@example\.com/i), {
      target: { value: "me@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/create a password/i), {
      target: { value: "abc12345" },
    });
    fireEvent.change(screen.getByPlaceholderText(/re-enter your password/i), {
      target: { value: "abc12345" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        email: "me@test.com",
        password: "abc12345",
      });
      expect(mockNavigate).toHaveBeenCalled();
    });

    // optional: assert message contents
    const navArgs = mockNavigate.mock.calls[0];
    expect(navArgs[0]).toBe("/login");
    expect(navArgs[1]?.state?.msg).toMatch(/account created/i);
  });

  it("surfaces server error detail text", async () => {
    mockRegister.mockRejectedValueOnce({
      response: { data: { detail: "Email already exists" } },
    });
    setup();

    fireEvent.change(screen.getByPlaceholderText(/you@example\.com/i), {
      target: { value: "taken@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/create a password/i), {
      target: { value: "abc12345" },
    });
    fireEvent.change(screen.getByPlaceholderText(/re-enter your password/i), {
      target: { value: "abc12345" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(await screen.findByText(/email already exists/i)).toBeInTheDocument();
  });
});
