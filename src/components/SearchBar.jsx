import { useRef, useState } from "react";
import TaskList from "./TaskList";

function SearchBar() {
  const [query, setQuery] = useState("");
  const searchInput = useRef(null);

  function handleSearch() {
    // The ref holds the input; state makes the filtered list re-render.
    setQuery(searchInput.current.value);
  }


  return (
    <div className="search-container">
      <input
        ref={searchInput}
        type="text"
        aria-label="Search tasks"
        placeholder="Search tasks..."
        value={query}
        onChange={handleSearch}
      />
      <TaskList query={query} />
    </div>
  );
}

export default SearchBar;
