import { useLocation, Link, useNavigate } from "react-router";
import { useState, useMemo } from "react";
import { createTrip, createActivity, createChecklistItem } from "../api/client";

export default function Confirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  // Show the saved popup after the trip is saved.
  const [saved, setSaved] = useState(false);

  // Get the itinerary passed from the previous page.
  // The ? prevents an error if there is no router state.
  const itinerary = location.state?.itinerary;

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

      // I convert that string into numbers before sending it:
      if (itinerary.budget < 0) {
        setMessage("Enter budget as minimum 0");
        return;
      }
      // Then I send that array to the backend:
      const savedTrip = await createTrip({
        destination: itinerary.destination,
        date_Range: [itinerary.startDate, itinerary.endDate],
        budget: itinerary.budget,
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

      // Save every generated checklist item.
      for (const item of itinerary.checklist || []) {
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
      <div>Confirm Itinerary</div>

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

          <h3 className="mb-2 mt-6 text-xl font-semibold">Checklist</h3>

          <ul className="list-disc pl-6">
            {(itinerary.checklist || []).map((item, index) => (
              <li key={index}>{item.text}</li>
            ))}
          </ul>

          <button
            type="button"
            onClick={handleSaveTrip}
            className="mt-6 rounded-md bg-green-600 px-4 py-2 text-white"
          >
            Save Trip
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
