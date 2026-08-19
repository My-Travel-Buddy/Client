import { useState } from "react";
import {
  createChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
} from "../api/client";

// The saved-trip checklist. Matches the Confirmation page's checklist so the
// same list looks the same before and after the trip is saved — progress bar,
// tick to complete, add a task, and remove one.
//
// The difference is where the data lives. On Confirmation the list is still in
// React state and nothing has been saved yet, so every change is local. Here
// each item is a database row, so every change is a request first and a screen
// update second.
function Checklist({ trip, setTrip }) {
  // What the user is typing in the "add a task" box.
  const [newTask, setNewTask] = useState("");

  // Shown when a request fails, instead of an alert().
  const [message, setMessage] = useState("");

  // Sequelize returns the included rows as `Checklists`, capitalised.
  const items = trip.Checklists || [];

  // Derived on every render rather than stored — a stored copy would go stale
  // the moment an item is ticked, added or removed.
  const doneCount = items.filter((item) => item.completed).length;

  const percent =
    items.length === 0 ? 0 : Math.round((doneCount / items.length) * 100);

  // Replace the whole Checklists array with a new one. React compares
  // references, so mutating the existing array would change nothing on screen.
  function setItems(nextItems) {
    setTrip({ ...trip, Checklists: nextItems });
  }

  // Tick or untick one item.
  async function toggleItem(item) {
    setMessage("");

    try {
      const updated = await updateChecklistItem(trip.id, item.id, {
        completed: !item.completed,
      });

      // Trust the row the server returns rather than assuming our guess was
      // right — any server-side coercion shows up immediately.
      setItems(items.map((row) => (row.id === updated.id ? updated : row)));
    } catch (error) {
      setMessage(error.message);
    }
  }

  // Add the typed task.
  async function addTask(event) {
    event.preventDefault();

    if (newTask.trim() === "") {
      return;
    }

    setMessage("");

    try {
      const saved = await createChecklistItem(trip.id, {
        text: newTask.trim(),
        completed: false,
      });

      setItems([...items, saved]);
      setNewTask("");
    } catch (error) {
      setMessage(error.message);
    }
  }

  // Remove one item. Deleting cannot be undone, so ask first.
  async function removeItem(item) {
    const confirmed = window.confirm(`Remove "${item.text}" from the checklist?`);

    if (!confirmed) {
      return;
    }

    setMessage("");

    try {
      await deleteChecklistItem(item.id);

      // Take it off the screen without reloading the whole trip.
      setItems(items.filter((row) => row.id !== item.id));
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div className="checklist-card">
      <h3>Trip Preparation Checklist</h3>

      <div className="checklist-progress">
        <span>Tasks Completed</span>

        <span className="checklist-count">
          {doneCount} of {items.length} ({percent}%)
        </span>
      </div>

      <div className="checklist-bar">
        <div
          className="checklist-bar-fill"
          style={{ width: `${percent}%` }}
        ></div>
      </div>

      <ul className="checklist-items">
        {items.map((item) => (
          <li key={item.id}>
            <label>
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => toggleItem(item)}
              />

              <span>{item.text}</span>
            </label>

            {/* Remove this item. aria-label names what it deletes, because
                "x" on its own tells a screen reader nothing. */}
            <button
              type="button"
              className="checklist-delete"
              aria-label={`Remove ${item.text}`}
              onClick={() => removeItem(item)}
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      {items.length === 0 && (
        <p className="checklist-empty">
          Nothing on the list yet. Add your first task below.
        </p>
      )}

      <form className="checklist-add" onSubmit={addTask}>
        <input
          type="text"
          value={newTask}
          placeholder="Add a preparation task..."
          onChange={(event) => setNewTask(event.target.value)}
        />

        <button type="submit">+</button>
      </form>

      {/* Failures used to be an alert(); this keeps them in the page. */}
      {message && <p className="checklist-error">{message}</p>}
    </div>
  );
}

export default Checklist;
