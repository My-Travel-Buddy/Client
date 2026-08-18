import { useState } from "react";
import { createActivity } from "../api/client";

// These categories must match the ones allowed by the backend.
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

// Form for adding a new activity to a trip.
// defaultDate fills in the date when the form is opened from a specific day.
// minDate and maxDate keep the activity inside the trip dates.
function ActivityEdit({
  trip,
  setTrip,
  onClose,
  defaultDate = "",
  minDate,
  maxDate,
}) {
  // Store all the form values together.
  const [form, setForm] = useState({
    title: "",
    category: "Culture",
    estimatedCost: "",
    date: defaultDate,
    time: "",
    notes: "",
  });

  // Stores an error message if something goes wrong.
  const [message, setMessage] = useState("");

  // Tracks whether the activity is currently being saved.
  const [saving, setSaving] = useState(false);

  // Update the form field that the user changes.
  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      // Combine the date and time into one dateTime value.
      const dateTime = new Date(`${form.date}T${form.time}`).toISOString();

      // Send the new activity to the backend.
      const savedActivity = await createActivity(trip.id, {
        title: form.title,
        category: form.category,
        dateTime,

        // Convert the cost from text to a number.
        estimatedCost: Number(form.estimatedCost || 0),

        notes: form.notes,
      });

      // Add the saved activity to the page immediately.
      setTrip({
        ...trip,
        Activities: [...(trip.Activities || []), savedActivity],
      });

      // Close the form after saving.
      onClose();
    } catch (error) {
      // Show the error if saving fails.
      setMessage(error.message);
    }

    setSaving(false);
  }

  return (
    <div className="modal-backdrop">
      <form className="modal" onSubmit={handleSubmit}>
        <div className="modal-head">
          <h3>Add New Activity</h3>

          {/* Close the form. */}
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
              {/* Create one option for each allowed category. */}
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
              // Keep the activity date inside the trip dates.
              min={minDate}
              max={maxDate}
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

        {/* Show an error message if saving fails. */}
        {message && <p className="modal-error">{message}</p>}

        <div className="modal-actions">
          <button type="button" className="modal-cancel" onClick={onClose}>
            Cancel
          </button>

          {/* Disable the button while the activity is saving. */}
          <button type="submit" className="modal-save" disabled={saving}>
            {saving ? "Saving..." : "Save Activity"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ActivityEdit;
