import { useLocation, Link, useNavigate } from "react-router";
import { useState, useMemo } from "react";
import { createTrip, createActivity, createChecklistItem } from "../api/client";

export default function Confirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  // Show the saved popup after the trip is saved.
  const [saved, setSaved] = useState(false);

  // The itinerary arrives in the router state, but that is lost on a refresh
  // or after a trip to the login page. So we keep a copy in sessionStorage
  // and fall back to it. sessionStorage clears when the tab closes.
  if (location.state?.itinerary) {
    sessionStorage.setItem(
      "itinerary",
      JSON.stringify(location.state.itinerary),
    );
  }

  const savedItinerary = sessionStorage.getItem("itinerary");

  const itinerary =
    location.state?.itinerary ||
    (savedItinerary ? JSON.parse(savedItinerary) : null);

  // The checklist lives in state so the boxes can be ticked and new tasks
  // added before the trip is saved.
  const [checklist, setChecklist] = useState(itinerary?.checklist || []);

  // What the user is typing in the "add a task" box.
  const [newTask, setNewTask] = useState("");

  // How many are done, as a count and as a percentage for the bar.
  const doneCount = checklist.filter((item) => item.completed).length;

  const percent =
    checklist.length === 0
      ? 0
      : Math.round((doneCount / checklist.length) * 100);

  // Tick or untick one item.
  function toggleItem(index) {
    const updated = [...checklist];

    updated[index] = {
      ...updated[index],
      completed: !updated[index].completed,
    };

    setChecklist(updated);
  }

  // Add the typed task to the bottom of the list.
  function addTask(event) {
    event.preventDefault();

    if (newTask.trim() === "") {
      return;
    }

    setChecklist([...checklist, { text: newTask.trim(), completed: false }]);
    setNewTask("");
  }

  // Group activities by date so each day is shown together.
  const days = useMemo(() => {
    const buckets = new Map();

    for (const activity of itinerary?.activities || []) {
      // Get only the date from the dateTime.
      // Example: "2026-08-14T09:00:00Z" -> "2026-08-14"
      const key = String(activity.dateTime).slice(0, 10);

      if (!buckets.has(key)) {
        buckets.set(key, []);
      }

      buckets.get(key).push(activity);
    }

    return [...buckets.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, activities]) => ({
        key,
        activities: [...activities].sort((a, b) =>
          String(a.dateTime).localeCompare(String(b.dateTime)),
        ),
        total: activities.reduce(
          (sum, activity) => sum + Number(activity.estimatedCost || 0),
          0,
        ),
        label: new Date(`${key}T00:00:00`).toLocaleDateString([], {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
      }));
  }, [itinerary]);

  async function handleSaveTrip() {
    console.log("SAVE BUTTON CLICKED");

    if (!itinerary) {
      return;
    }

    try {
      setMessage("Saving trip...");

      // The budget arrives as text from the form. The database needs a real
      // number above 0 — an empty box or 0 is what used to make the save fail
      // with "Something went wrong on the server".
      const budget = Number(itinerary.budget);

      if (!budget || budget <= 0) {
        setMessage(
          "This trip has no budget. Go back to the home page and generate it again with a budget above 0.",
        );
        return;
      }
      // Then I send that array to the backend:
      const savedTrip = await createTrip({
        destination: itinerary.destination,
        date_Range: [itinerary.startDate, itinerary.endDate],
        budget,
      });

      const tripId = savedTrip.id;

      // Save every generated activity.
      for (const activity of itinerary.activities || []) {
        await createActivity(tripId, {
          title: activity.title,
          category: activity.category,
          dateTime: activity.dateTime,
          estimatedCost: activity.estimatedCost,
          notes: activity.notes,
        });
      }

      // Save the checklist from state, so ticked boxes and any task the user
      // added are saved too.
      for (const item of checklist) {
        await createChecklistItem(tripId, {
          text: item.text,
          completed: item.completed,
        });
      }

      setMessage("");
      setSaved(true);
    } catch (error) {
      // Saving needs an account. Rather than showing "Authentication
      // required" and leaving them stuck, send them to log in — and carry
      // the itinerary along so it isn't lost on the way.
      if (error.status === 401) {
        navigate("/login", {
          state: { from: "/trips/itinerary", itinerary },
        });
        return;
      }

      setMessage(error.message);
    }
  }

  return (
    <>
      {/* Step label above the itinerary title. */}
      <div className="page-eyebrow">Confirm Itinerary</div>

      {/* No plan to show — say so instead of rendering an empty page. */}
      {!itinerary && (
        <div className="trips-empty">
          <div className="trips-empty-icon">🧭</div>

          <h3>No itinerary to confirm</h3>

          <p>
            The generated plan is gone — this can happen after a refresh.
            Generate a new itinerary from the home page.
          </p>

          <Link to="/" className="plan-trip-button">
            Plan a trip
          </Link>
        </div>
      )}

      {itinerary && (
        <section className="mt-8">
          <h2 className="mb-2 text-2xl font-bold">{itinerary.title}</h2>

          <p className="mb-4 text-gray-600">{itinerary.summary}</p>

          {itinerary.hasMoreDays && (
            <p className="mb-4">
              Your trip is {itinerary.tripDays} days. We generated the first{" "}
              {itinerary.generatedDays} days.
            </p>
          )}

          <h3 className="mb-3 text-xl font-semibold">Activities</h3>

          <div className="space-y-4">
            {days.map((day, dayIndex) => (
              // <details> gives us open/close, keyboard support and the
              // disclosure semantics for free — no state to manage.
              <details
                key={day.key}
                className="day-group"
                open={dayIndex === 0}
              >
                <summary>
                  <span className="day-group-title">
                    Day {dayIndex + 1}
                    <span className="day-group-date">{day.label}</span>
                  </span>

                  <span className="day-group-meta">
                    {day.activities.length}{" "}
                    {day.activities.length === 1 ? "activity" : "activities"}
                    {" · "}${day.total}
                  </span>
                </summary>

                <div className="day-group-body">
                  {day.activities.map((activity, index) => (
                    <div
                      key={index}
                      className="rounded-md border border-gray-200 bg-white p-4"
                    >
                      <h4 className="mb-2 font-semibold">{activity.title}</h4>

                      <p>
                        Time:{" "}
                        {new Date(activity.dateTime).toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                      <p>Category: {activity.category}</p>
                      <p>Estimated Cost: ${activity.estimatedCost}</p>
                      <p className="mt-2">{activity.notes}</p>
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>

          <div className="checklist-card">
            <h3>Trip Preparation Checklist</h3>

            <div className="checklist-progress">
              <span>Tasks Completed</span>

              <span className="checklist-count">
                {doneCount} of {checklist.length} ({percent}%)
              </span>
            </div>

            <div className="checklist-bar">
              <div
                className="checklist-bar-fill"
                style={{ width: `${percent}%` }}
              ></div>
            </div>

            <ul className="checklist-items">
              {checklist.map((item, index) => (
                <li key={index}>
                  <label>
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => toggleItem(index)}
                    />

                    <span>{item.text}</span>
                  </label>
                </li>
              ))}
            </ul>

            <form className="checklist-add" onSubmit={addTask}>
              <input
                type="text"
                value={newTask}
                placeholder="Add a preparation task..."
                onChange={(event) => setNewTask(event.target.value)}
              />

              <button type="submit">+</button>
            </form>
          </div>

          <button
            type="button"
            onClick={handleSaveTrip}
            className="mt-6 rounded-md bg-green-600 px-4 py-2 text-white"
          >
            Save Trip to My Account
          </button>

          {/* Errors from the save were being swallowed — show them. */}
          {message && <p className="save-error">{message}</p>}
        </section>
      )}

      {/* Confirmation popup: the save worked, so point them at the history. */}
      {saved && (
        <div
          className="save-popup-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="save-popup-title"
        >
          <div className="save-popup">
            <h3 id="save-popup-title">Trip saved</h3>

            <p>
              Your itinerary is stored. You can open it any time from your trip
              history.
            </p>

            <div className="save-popup-actions">
              <Link to="/trips" className="save-popup-primary">
                Visit trip history
              </Link>

              <button
                type="button"
                className="save-popup-secondary"
                onClick={() => setSaved(false)}
              >
                Stay here
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
