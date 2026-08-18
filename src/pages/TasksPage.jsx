import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getTasks, createTask, updateTask, deleteTask } from "../api/tasks";

// Shows all task actions: view, add, update, and delete.
export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState(""); // Store the new task title.

  // Load the tasks when the page opens.
  useEffect(() => {
    getTasks()
      .then(setTasks)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Create a new task.
  async function handleCreate(e) {
    e.preventDefault(); // Stop the page from reloading.
    if (!title.trim()) return;

    try {
      const newTask = await createTask({ title });
      setTasks([newTask, ...tasks]);
      setTitle("");
    } catch (err) {
      setError(err.message);
    }
  }

  // Mark a task complete or incomplete.
  async function handleToggle(task) {
    try {
      const updated = await updateTask(task.id, { completed: !task.completed });
      setTasks(tasks.map((t) => (t.id === task.id ? updated : t)));
    } catch (err) {
      setError(err.message);
    }
  }

  // Delete a task.
  async function handleDelete(id) {
    try {
      await deleteTask(id);
      setTasks(tasks.filter((t) => t.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <p>Loading tasks…</p>;

  return (
    <section>
      <h1 className="mb-6 text-3xl font-semibold text-(--text-h)">Tasks</h1>

      {/* Show an error message if something goes wrong. */}
      {error && (
        <p className="mb-4 rounded-md bg-red-500/10 px-3 py-2 text-red-500">
          {error}
        </p>
      )}

      {/* Form for adding a new task. */}
      <form onSubmit={handleCreate} className="mb-6 flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New task title…"
          className="flex-1 rounded-md border border-(--border) bg-transparent px-3 py-2"
        />
        <button
          type="submit"
          className="rounded-md bg-(--accent) px-4 py-2 font-medium text-white"
        >
          Add
        </button>
      </form>

      {/* Show a message if there are no tasks, otherwise show the list. */}
      {tasks.length === 0 ? (
        <p>No tasks yet. Add one above.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center gap-3 rounded-md border border-(--border) px-4 py-3"
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggle(task)}
              />

              {/* Open the task details when the title is clicked. */}
              <Link
                to={`/tasks/${task.id}`}
                className={
                  task.completed ? "flex-1 line-through opacity-60" : "flex-1"
                }
              >
                {task.title}
              </Link>

              <button
                onClick={() => handleDelete(task.id)}
                className="text-sm text-red-500 hover:underline"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
