import { useState, useId, useContext } from "react";
import { TaskContext } from "../context/TaskContext";

function TaskForm() {
  const [taskName, setTaskName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputId = useId();
  const { addTask, isLoading } = useContext(TaskContext);

  async function handleSubmit(e) {
    e.preventDefault();
    if (taskName.trim() === "" || isSubmitting || isLoading) return;
    setIsSubmitting(true);
    const saved = await addTask(taskName);
    if (saved) setTaskName("");
    setIsSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor={inputId}>New Task:</label>
      <input
        id={inputId}
        type="text"
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
        placeholder="Add a new task..."
        disabled={isSubmitting}
      />
      <button type="submit" disabled={isSubmitting || isLoading}>Add Task</button>
    </form>
  );
}

export default TaskForm;
