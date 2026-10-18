import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import App from "../components/App";
import { TaskProvider } from "../context/TaskContext";

function renderApp() {
  render(<TaskProvider><App /></TaskProvider>);
}

test("waits for initial tasks before saving a new task", async () => {
  let finishLoading;
  global.fetch = vi.fn(() => new Promise((resolve) => {
    finishLoading = resolve;
  }));
  renderApp();

  const input = screen.getByLabelText("New Task:");
  const button = screen.getByRole("button", { name: "Add Task" });
  fireEvent.change(input, { target: { value: "  Study hooks  " } });
  expect(button).toBeDisabled();
  fireEvent.click(button);
  expect(global.fetch).toHaveBeenCalledTimes(1);

  await act(async () => {
    finishLoading({ ok: true, json: async () => global.baseTasks });
  });
  expect(button).toBeEnabled();

  global.setFetchResponse({ id: "3", title: "Study hooks", completed: false });
  fireEvent.click(button);
  expect(await screen.findByText("Study hooks")).toBeInTheDocument();
  expect(screen.getByText("Buy groceries")).toBeInTheDocument();
  expect(global.fetch).toHaveBeenCalledWith("http://localhost:6001/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Study hooks", completed: false }),
  });
  expect(input).toHaveValue("");
});

test("saves both Complete and Undo to the backend", async () => {
  global.setFetchResponse(global.baseTasks);
  renderApp();
  const button = await screen.findByTestId("1");

  for (const completed of [true, false]) {
    global.setFetchResponse({ ...global.baseTasks[0], completed });
    fireEvent.click(button);
    await waitFor(() => expect(button).toHaveTextContent(completed ? "Undo" : "Complete"));
    expect(global.fetch).toHaveBeenCalledWith("http://localhost:6001/tasks/1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
    });
  }
});

test("keeps the task name when saving fails", async () => {
  global.setFetchResponse(global.baseTasks);
  renderApp();
  await screen.findByText("Buy groceries");
  const input = screen.getByLabelText("New Task:");
  const button = screen.getByRole("button", { name: "Add Task" });
  await waitFor(() => expect(button).toBeEnabled());

  global.fetch = vi.fn().mockResolvedValue({ ok: false });
  fireEvent.change(input, { target: { value: "Study hooks" } });
  fireEvent.click(button);

  expect(await screen.findByRole("alert")).toHaveTextContent("Could not add the task");
  expect(input).toHaveValue("Study hooks");
  expect(screen.queryByText("Study hooks")).not.toBeInTheDocument();
});
