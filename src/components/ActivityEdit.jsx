import { useState } from "react";
import { createActivity } from "../api/client";

// These must match the categories the backend allows.
const CATEGORIES = [
  "Food",
  "Sightseeing",
  "Culture",
  "Adventure",
  "Shopping",
  "Transportation",
  "Entertainment",
  "Other",
];
// The “Add New Activity” pop-up.
// trip     - the trip receiving the new activity
// setTrip  - updates the trip so the new activity appears immediately
// onClose  - closes the pop-up when the user cancels, clicks X, or saves successfully
function ActivityEdit({ trip, setTrip, onClose }) {
  // Store all form fields in one object so one handler can update any field.
  const [form, setForm] = useState({
    title: "",
    category: "Culture",
    estimatedCost: "",
    date: "",
    time: "",
    notes: "",
  });

  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  // `name` on the input tells us which key to change.
  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      // The form has separate date and time boxes, but the database keeps
      // one dateTime, so we join them: "2026-08-15" + "T" + "12:30".
      const dateTime = new Date(`${form.date}T${form.time}`).toISOString();

      const savedActivity = await createActivity(trip.id, {
        title: form.title,
        category: form.category,
        dateTime,
        // Inputs always give strings, and the column is a number.
        estimatedCost: Number(form.estimatedCost || 0),
        notes: form.notes,
      });

      // Add it to the list on screen without reloading the trip.
      setTrip({
        ...trip,
        Activities: [...(trip.Activities || []), savedActivity],
      });

      onClose();
    } catch (error) {
      setMessage(error.message);
    }

    setSaving(false);
  }

  return (
    <div className="modal-backdrop">
      <form className="modal" onSubmit={handleSubmit}>
        <div className="modal-head">
          <h3>Add New Activity</h3>

          <button type="button" className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-field">
          <label htmlFor="title">Activity Title</label>

          <input
            id="title"
            name="title"
            value={form.title}
            placeholder="Tea Ceremony at Gion"
            onChange={handleChange}
            required
          />
        </div>

        <div className="modal-row">
          <div className="modal-field">
            <label htmlFor="category">Category</label>

            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              {CATEGORIES.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="modal-field">
            <label htmlFor="estimatedCost">Estimated Cost</label>

            <input
              id="estimatedCost"
              name="estimatedCost"
              type="number"
              min="0"
              step="0.01"
              value={form.estimatedCost}
              placeholder="35"
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="modal-row">
          <div className="modal-field">
            <label htmlFor="date">Date</label>

            <input
              id="date"
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="modal-field">
            <label htmlFor="time">Time</label>

            <input
              id="time"
              name="time"
              type="time"
              value={form.time}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="modal-field">
          <label htmlFor="notes">Notes</label>

          <textarea
            id="notes"
            name="notes"
            rows="3"
            value={form.notes}
            placeholder="Book reservation in advance. Wear smart-casual attire."
            onChange={handleChange}
          />
        </div>

        {message && <p className="modal-error">{message}</p>}

        <div className="modal-actions">
          <button type="button" className="modal-cancel" onClick={onClose}>
            Cancel
          </button>

          <button type="submit" className="modal-save" disabled={saving}>
            {saving ? "Saving..." : "Save Activity"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ActivityEdit;
