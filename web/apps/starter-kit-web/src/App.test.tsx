import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, test, vi } from "vitest";
import { App } from "./App";

beforeEach(() => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

test("renders starter message", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response("Healthy", { status: 200 }),
  );

  render(<App />);

  expect(
    await screen.findByText(
      "React, TanStack Query, and TanStack Router are ready.",
    ),
  ).toBeDefined();
});
