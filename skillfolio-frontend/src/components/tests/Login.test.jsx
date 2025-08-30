import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Login from "@/pages/Login.jsx";

// --- Mocks ---

// Spy to capture navigation
const navigateMock = vi.fn();

// Mock react-router-dom but keep the real components (MemoryRouter, Link, etc.)
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

// We'll replace this per-test with resolve/reject
const loginMock = vi.fn();

// Mock the Zustand store hook to return a state object that includes our loginMock
vi.mock("@/store/useAppStore", () => {
  return {
    useAppStore: (selector) => {
      const state = {
        login: loginMock,
      };
      return selector ? selector(state) : state;
    },
  };
});

function renderLogin() {
  // Use MemoryRouter so <Link> renders without errors
  const { MemoryRouter } = require("react-router-dom");
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
}

beforeEach(() => {
  loginMock.mockReset();
  navigateMock.mockReset();
});

describe("Login page", () => {
  it("renders inputs and submit button", () => {
    renderLogin();

    expect(screen.getByText(/log in to skillfolio/i)).toBeInTheDocument();
    // Inputs are easiest to select by placeholder here
    expect(screen.getByPlaceholderText(/you@example\.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/•+/)).toBeInTheDocument(); // password bullets
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });

  it("submits and navigates to /dashboard on success", async () => {
    loginMock.mockResolvedValueOnce({ user: { email: "a@b.com" } });

    renderLogin();

    await userEvent.type(screen.getByPlaceholderText(/you@example\.com/i), "a@b.com");
    await userEvent.type(screen.getByPlaceholderText(/•+/, { selector: "input" }), "secret123");

    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({ email: "a@b.com", password: "secret123" });
      expect(navigateMock).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("shows server error detail on failure", async () => {
    loginMock.mockRejectedValueOnce({
      response: { data: { detail: "Invalid credentials" } },
    });

    renderLogin();

    await userEvent.type(screen.getByPlaceholderText(/you@example\.com/i), "wrong@user.com");
    await userEvent.type(screen.getByPlaceholderText(/•+/, { selector: "input" }), "badpass");

    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
