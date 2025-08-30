import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ProgressBar from "../ProgressBar";

describe("ProgressBar", () => {
  it("renders with default 0%", () => {
    render(<ProgressBar />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
    expect(bar).toHaveAttribute("aria-valuenow", "0");
    expect(screen.getByText("0%")).toBeInTheDocument();

    const fill = bar.querySelector('[aria-hidden="true"]');
    expect(fill).toHaveStyle({ width: "0%" });
  });

  it("clamps negative values to 0%", () => {
    render(<ProgressBar value={-5} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "0");
    const fill = bar.querySelector('[aria-hidden="true"]');
    expect(fill).toHaveStyle({ width: "0%" });
  });

  it("clamps >100 to 100%", () => {
    render(<ProgressBar value={420} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "100");
    expect(screen.getByText("100%")).toBeInTheDocument();

    const fill = bar.querySelector('[aria-hidden="true"]');
    expect(fill).toHaveStyle({ width: "100%" });
  });

  it("shows label when provided", () => {
    render(<ProgressBar value={42} label="Checklist progress" />);
    expect(screen.getByText("Checklist progress")).toBeInTheDocument();
    expect(screen.getByText("42%")).toBeInTheDocument();
  });

  it("coerces non-numeric to 0%", () => {
    // @ts-expect-error: intentionally passing a bad value to test coercion
    render(<ProgressBar value={"abc"} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "0");
    expect(screen.getByText("0%")).toBeInTheDocument();
  });
});
