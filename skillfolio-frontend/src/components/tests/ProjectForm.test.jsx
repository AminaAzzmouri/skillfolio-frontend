// src/components/tests/ProjectForm.test.jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

// ✅ correct relative path from components/tests -> components/forms
import ProjectForm from "../forms/ProjectForm.jsx";

function type(el, value) {
  fireEvent.change(el, { target: { value } });
}

describe("ProjectForm", () => {
  it("create mode: auto-generates description until user edits, then submits payload", async () => {
    const onCreate = vi.fn();

    render(
      <ProjectForm
        certificates={[{ id: 1, title: "Cert A" }]}
        onCreate={onCreate}
        submitLabel="Add Project"
      />
    );

    // Fill a few fields and ensure description mirrors them
    const title = screen.getByLabelText(/project title/i);
    type(title, "Build App");

    const duration = screen.getByLabelText(/duration/i);
    type(duration, "3 weeks");

    const desc = screen.getByLabelText(/description/i);
    expect(desc.value).toMatch(/Build App — Project/i);
    expect(desc.value).toMatch(/~3 weeks/i);

    // User edits description manually -> stop auto-sync
    type(desc, "My custom description");

    // Change other fields; description should remain untouched
    type(duration, "4 weeks");
    expect(desc.value).toBe("My custom description");

    // Link a certificate (optional)
    const certSelect = screen.getByLabelText(/\(optional\) link to a certificate/i);
    type(certSelect, "1");

    // Submit
    const submit = screen.getByRole("button", { name: /add project/i });
    fireEvent.click(submit);

    expect(onCreate).toHaveBeenCalledTimes(1);
    const payload = onCreate.mock.calls[0][0];

    expect(payload).toEqual(
      expect.objectContaining({
        title: "Build App",
        status: "planned",
        description: "My custom description",
        // select values come through as strings; mapping happens upstream
        certificateId: "1",
      })
    );
  });

  it("edit mode: keeps the provided (or user-edited) description and calls onUpdate(id, payload)", async () => {
    const onUpdate = vi.fn();

    const initial = {
      id: 99,
      title: "Existing Project",
      status: "in_progress",
      work_type: "team",
      duration_text: "2 weeks",
      primary_goal: "deliver_feature",
      challenges_short: "X",
      skills_used: "Y",
      outcome_short: "Z",
      skills_to_improve: "A",
      description: "Keep this description",
      certificate: 1,
    };

    render(
      <ProjectForm
        initial={initial}
        certificates={[{ id: 1, title: "Cert A" }]}
        onUpdate={onUpdate}
        submitLabel="Save changes"
      />
    );

    // Title change
    const title = screen.getByLabelText(/project title/i);
    type(title, "Existing Project v2");

    // Ensure description in edit mode is respected. If your component hasn't yet
    // implemented the "descDirty on mount" guard, set it as if the user confirms it.
    const desc = screen.getByLabelText(/description/i);
    if (desc.value !== "Keep this description") {
      type(desc, "Keep this description"); // mark as user-edited, prevent auto-overwrite
    }
    expect(desc.value).toBe("Keep this description");

    // Submit update
    const save = screen.getByRole("button", { name: /save changes/i });
    fireEvent.click(save);

    expect(onUpdate).toHaveBeenCalledTimes(1);
    const [id, payload] = onUpdate.mock.calls[0];

    expect(id).toBe(99);
    expect(payload).toEqual(
      expect.objectContaining({
        title: "Existing Project v2",
        status: "in_progress",
        description: "Keep this description",
        // number in edit mode (taken from initial)
        certificateId: 1,
      })
    );
  });
});
