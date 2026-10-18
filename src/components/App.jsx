import { useContext } from "react";
import { TaskContext } from "../context/TaskContext";
import TaskForm from "./TaskForm";
import SearchBar from "./SearchBar";

function App() {
  const { error, isLoading } = useContext(TaskContext);

  return (
    <main className="container">
      <h1>Task Manager</h1>
      {isLoading && <p role="status">Loading tasks...</p>}
      {error && <p role="alert">{error}</p>}
      <TaskForm />
      <SearchBar />
    </main>
  );
}

export default App;
