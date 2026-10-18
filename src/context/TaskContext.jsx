import { createContext, useEffect, useState } from "react";

export const TaskContext = createContext();
const tasksUrl = "http://localhost:6001/tasks";

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(tasksUrl)
      .then((response) => {
        if (!response.ok) throw new Error("Could not load tasks.");
        return response.json();
      })
      .then(setTasks)
      .catch(() => setError("Could not load tasks. Make sure the server is running."))
      .finally(() => setIsLoading(false));
  }, []);

  async function addTask(title) {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return false;
    setError("");

    try {
      const response = await fetch(tasksUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmedTitle, completed: false }),
      });
      if (!response.ok) throw new Error("Could not add task.");
      const newTask = await response.json();

      // Use the saved task so its ID matches the backend.
      setTasks((currentTasks) => [...currentTasks, newTask]);
      return true;
    } catch {
      setError("Could not add the task. Please try again.");
      return false;
    }
  }

  async function toggleComplete(id) {
    const task = tasks.find((task) => task.id === id);
    if (!task) return;
    setError("");

    try {
      const response = await fetch(`${tasksUrl}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task.completed }),
      });
      if (!response.ok) throw new Error("Could not update task.");
      const updatedTask = await response.json();

      // Replace only the task that was saved to db.json.
      setTasks((currentTasks) =>
        currentTasks.map((task) => (task.id === id ? updatedTask : task))
      );
    } catch {
      setError("Could not update the task. Please try again.");
    }
  }

  return (
    <TaskContext.Provider value={{ tasks, addTask, toggleComplete, error, isLoading }}>
      {children}
    </TaskContext.Provider>
  );
}
