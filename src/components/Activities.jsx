import { useMemo, useState } from "react";
import ActivityEdit from "./ActivityEdit";
import { deleteActivity } from "../api/client";

function Activities({ trip, setTrip }) {
  // Stores the date of the day where we want to add an activity.
  // null means the add form is closed.
  const [addingFor, setAddingFor] = useState(null);

  // Create a list of all the days in the trip.
  // This makes sure empty days are still shown.
  const days = useMemo(() => {
    // Get the trip start and end dates.
    const startKey = trip.date_Range?.[0]?.value?.slice(0, 10);
    const endKey = trip.date_Range?.[1]?.value?.slice(0, 10);

    // Group activities by date.
    const buckets = new Map();

    for (const activity of trip.Activities || []) {
      // Get only the date part of the activity.
      const key = activity.dateTime
        ? String(activity.dateTime).slice(0, 10)
        : "unscheduled";

      // Create an empty list for this date if needed.
      if (!buckets.has(key)) {
        buckets.set(key, []);
      }

      // Add the activity to its date.
      buckets.get(key).push(activity);
    }

    // Create all the dates between the trip start and end date.
    const dayKeys = [];

    if (startKey && endKey) {
      const [sy, sm, sd] = startKey.split("-").map(Number);
      const [ey, em, ed] = endKey.split("-").map(Number);

      let cursor = Date.UTC(sy, sm - 1, sd);
      const last = Date.UTC(ey, em - 1, ed);

      // Add each trip date to the list.
      // The 370 limit prevents an invalid date range from looping forever.
      while (cursor <= last && dayKeys.length < 370) {
        dayKeys.push(new Date(cursor).toISOString().slice(0, 10));
        cursor += 24 * 60 * 60 * 1000;
      }
    }

    // Build the information we need for one day.
    const build = (key, dayNumber) => {
      const activities = buckets.get(key) || [];

      return {
        key,
        dayNumber,

        // Sort activities by time.
        activities: [...activities].sort((a, b) =>
          String(a.dateTime).localeCompare(String(b.dateTime)),
        ),

        // Add the cost of all activities for this day.
        total: activities.reduce(
          (sum, activity) => sum + Number(activity.estimatedCost || 0),
          0,
        ),

        // Create a readable date like "Wed, Aug 19".
        label:
          key === "unscheduled"
            ? "No date set"
            : new Date(`${key}T00:00:00`).toLocaleDateString([], {
                weekday: "short",
                month: "short",
                day: "numeric",
              }),

        outsideTrip: false,
      };
    };

    // Build all the normal days inside the trip.
    const inTrip = dayKeys.map((key, index) => build(key, index + 1));

    // Find activities that have a date outside the trip.
    // We still show them so the user knows they exist.
    const strays = [...buckets.keys()]
      .filter((key) => !dayKeys.includes(key))
      .sort((a, b) => {
        if (a === "unscheduled") return 1;
        if (b === "unscheduled") return -1;
        return a.localeCompare(b);
      })
      .map((key) => ({ ...build(key, null), outsideTrip: true }));

    // Return the normal trip days first, then outside activities.
    return [...inTrip, ...strays];
  }, [trip.Activities, trip.date_Range]);

  async function handleDelete(activity) {
    // Ask the user before deleting the activity.
    const confirmed = window.confirm(`Delete "${activity.title}"?`);

    if (!confirmed) {
      return;
    }

    try {
      // Delete the activity from the database.
      await deleteActivity(trip.id, activity.id);

      // Remove the deleted activity from the page.
      setTrip({
        ...trip,
        Activities: trip.Activities.filter((item) => item.id !== activity.id),
      });
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <>
      <div className="activities-head">
        <div>Activities</div>

        {/* We removed the main Add Activity button.
            Each trip day now has its own Add Activity button.

            <button
              type="button"
              className="add-activity-button"
              onClick={() => setAddingFor("new")}
            >
              + Add Activity
            </button>
        */}
      </div>

      {/* Show this message when the trip has no dates. */}
      {days.length === 0 && (
        <p className="activities-empty">
          This trip has no dates set, so there are no days to plan into.
        </p>
      )}

      <div className="space-y-4">
        {days.map((day, dayIndex) => (
          // details lets the user open and close each day.
          <details
            key={day.key}
            className={`day-group activities-day${
              day.outsideTrip ? " day-outside" : ""
            }`}
            open={dayIndex === 0}
          >
            <summary>
              <span className="day-group-title">
                {/* Show the correct trip day number. */}
                {day.key === "unscheduled"
                  ? "Unscheduled"
                  : day.outsideTrip
                    ? "Outside trip"
                    : `Day ${day.dayNumber}`}

                <span className="day-group-date">{day.label}</span>
              </span>

              <span className="day-group-meta">
                {day.activities.length}{" "}
                {day.activities.length === 1 ? "activity" : "activities"}
                {" · "}${day.total}
              </span>
            </summary>

            <div className="day-group-body">
              {/* Show all activities for this day. */}
              <div className="activities-grid">
                {day.activities.map((activity, index) => (
                  <div className="activity-card" key={activity.id || index}>
                    <button
                      type="button"
                      className="delete-activity"
                      aria-label={`Delete ${activity.title}`}
                      onClick={() => handleDelete(activity)}
                    >
                      ×
                    </button>

                    <ul>
                      <li>
                        {index + 1}. {activity.title}{" "}
                      </li>

                      <li>Category: {activity.category}</li>

                      <li>
                        When:{" "}
                        {activity.dateTime
                          ? new Date(activity.dateTime).toLocaleTimeString([], {
                              hour: "numeric",
                              minute: "2-digit",
                            })
                          : "—"}
                      </li>

                      <li>Cost: ${activity.estimatedCost}</li>
                    </ul>
                  </div>
                ))}
              </div>

              {/* Show a message when the day has no activities. */}
              {day.activities.length === 0 && (
                <p className="day-empty">Nothing planned for this day yet.</p>
              )}

              {/* Add a new activity directly to this trip day. */}
              {day.key !== "unscheduled" && !day.outsideTrip && (
                <button
                  type="button"
                  className="add-activity-day"
                  onClick={() => setAddingFor(day.key)}
                >
                  + Add activity to {day.label}
                </button>
              )}
            </div>
          </details>
        ))}
      </div>

      {/* Open the form for adding a new activity. */}
      {addingFor && (
        <ActivityEdit
          trip={trip}
          setTrip={setTrip}
          // Automatically use the selected day's date.
          defaultDate={addingFor === "new" ? "" : addingFor}
          // Keep the activity date inside the trip dates.
          minDate={trip.date_Range?.[0]?.value?.slice(0, 10)}
          maxDate={trip.date_Range?.[1]?.value?.slice(0, 10)}
          // Close the form.
          onClose={() => setAddingFor(null)}
        />
      )}
    </>
  );
}

export default Activities;
