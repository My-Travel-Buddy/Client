import { useMemo, useState } from "react";
import ActivityEdit from "./ActivityEdit";
import { deleteActivity } from "../api/client";
import { getCategoryStyle } from "../lib/categories";
import Icon from "./Icon";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function Activities({ trip, setTrip }) {
  // Stores which Add Activity form is open.
  // null = closed, "new" = blank date, or a date = prefill that day.
  const [addingFor, setAddingFor] = useState(null);

  const activities = trip.Activities || [];

  const total = activities.reduce(
    (sum, activity) => sum + Number(activity.estimatedCost || 0),
    0,
  );

  const startKey = trip.date_Range?.[0]?.value?.slice(0, 10);
  const endKey = trip.date_Range?.[1]?.value?.slice(0, 10);

  // Build the day list from the trip dates, not from the activities.
  // This keeps Day 1, Day 2, Day 3, etc. correct even when a day is empty.
  const days = useMemo(() => {
    // Group activities by date.
    const buckets = new Map();

    // Use trip.Activities directly so useMemo only recalculates when it changes.
    for (const activity of trip.Activities || []) {
      const key = activity.dateTime
        ? String(activity.dateTime).slice(0, 10)
        : "unscheduled";

      if (!buckets.has(key)) {
        buckets.set(key, []);
      }

      buckets.get(key).push(activity);
    }

    // Create every day from the trip start date to the end date.
    // Date.UTC prevents timezone changes from shifting the day.
    const dayKeys = [];

    if (startKey && endKey) {
      const [sy, sm, sd] = startKey.split("-").map(Number);
      const [ey, em, ed] = endKey.split("-").map(Number);
      let cursor = Date.UTC(sy, sm - 1, sd);
      const last = Date.UTC(ey, em - 1, ed);

      // Safety check so a bad date range cannot create an endless loop.
      while (cursor <= last && dayKeys.length < 370) {
        dayKeys.push(new Date(cursor).toISOString().slice(0, 10));
        cursor += MS_PER_DAY;
      }
    }

    const build = (key, dayNumber) => {
      const dayActivities = buckets.get(key) || [];

      return {
        key,
        dayNumber,
        activities: [...dayActivities].sort((a, b) =>
          String(a.dateTime).localeCompare(String(b.dateTime)),
        ),
        total: dayActivities.reduce(
          (sum, activity) => sum + Number(activity.estimatedCost || 0),
          0,
        ),
        label:
          key === "unscheduled"
            ? "No date set"
            : new Date(`${key}T00:00:00Z`).toLocaleDateString(undefined, {
                timeZone: "UTC",
                weekday: "long",
                month: "short",
                day: "numeric",
              }),
        outsideTrip: false,
      };
    };

    const inTrip = dayKeys.map((key, index) => build(key, index + 1));

    // Keep activities outside the trip dates visible so they can be noticed and fixed.
    const strays = [...buckets.keys()]
      .filter((key) => !dayKeys.includes(key))
      .sort((a, b) => {
        if (a === "unscheduled") return 1;
        if (b === "unscheduled") return -1;
        return a.localeCompare(b);
      })
      .map((key) => ({ ...build(key, null), outsideTrip: true }));

    return [...inTrip, ...strays];
  }, [trip.Activities, startKey, endKey]);

  async function handleDelete(activity) {
    // Ask the user before deleting the activity.
    const confirmed = window.confirm(`Delete "${activity.title}"?`);

    if (!confirmed) {
      return;
    }

    try {
      // Delete the activity from the database.
      await deleteActivity(trip.id, activity.id);

      // Remove the deleted activity from the screen without reloading.
      setTrip({
        ...trip,
        Activities: trip.Activities.filter((item) => item.id !== activity.id),
      });
    } catch (error) {
      alert(error.message);
    }
  }

  // Render one activity card.
  function renderCard(activity) {
    // Get the icon and style for this activity category.
    const style = getCategoryStyle(activity.category);

    return (
      <article className="activity-card" key={activity.id}>
        <button
          type="button"
          className="delete-activity"
          aria-label={`Delete ${activity.title}`}
          onClick={() => handleDelete(activity)}
        >
          ×
        </button>

        {/* Show the category as a small styled label. */}
        <span className={`activity-chip tint-${style.tint}`}>
          <Icon name={style.icon} size={14} />
          {activity.category || "Other"}
        </span>

        <h4 className="activity-title">{activity.title}</h4>

        {activity.notes && <p className="activity-notes">{activity.notes}</p>}

        <div className="activity-meta">
          {/* Show only the time because the date is already in the day heading. */}
          <span className="activity-time">
            {activity.dateTime
              ? new Date(activity.dateTime).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                })
              : "No time set"}
          </span>

          <span className="activity-cost">
            {Number(activity.estimatedCost) > 0
              ? `$${Number(activity.estimatedCost).toLocaleString()}`
              : "Free"}
          </span>
        </div>
      </article>
    );
  }

  return (
    <>
      <div className="activities-head">
        <div className="activities-head-text">
          <h2>Activities</h2>
          <p>
            {activities.length}{" "}
            {activities.length === 1 ? "activity" : "activities"} across{" "}
            {days.filter((day) => !day.outsideTrip).length} days · $
            {total.toLocaleString()} planned
          </p>
        </div>

        <button
          type="button"
          className="add-activity-button"
          onClick={() => setAddingFor("new")}
        >
          + Add Activity
        </button>
      </div>

      {days.length === 0 && (
        <div className="activities-empty">
          <Icon name="calendar" size={38} />
          <h3>This trip has no dates set</h3>
          <p>Without a date range there are no days to plan into.</p>
        </div>
      )}

      <div className="day-list">
        {days.map((day) => (
          // Each day can open and close.
          // Days with activities start open; empty days start closed.
          <details
            key={day.key}
            // CSS class for the day section in the Activities tab.
            className={`day-group activities-day${day.outsideTrip ? " day-outside" : ""}`}
            open={day.activities.length > 0}
          >
            <summary>
              <span className="day-group-title">
                {/* The day number comes from the trip date range. */}
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
                {day.total > 0 && ` · $${day.total.toLocaleString()}`}
              </span>
            </summary>

            <div className="day-group-body">
              {day.activities.length === 0 ? (
                <p className="day-empty">Nothing planned for this day yet.</p>
              ) : (
                <div className="activities-grid">
                  {day.activities.map(renderCard)}
                </div>
              )}

              {/* Open the Add Activity form with this day already selected. */}
              {day.key !== "unscheduled" && !day.outsideTrip && (
                <button
                  type="button"
                  className="add-activity-day"
                  onClick={() => setAddingFor(day.key)}
                >
                  + Add to Day {day.dayNumber}
                </button>
              )}
            </div>
          </details>
        ))}
      </div>

      {addingFor && (
        <ActivityEdit
          trip={trip}
          setTrip={setTrip}
          // If adding from the main button, leave the date blank.
          defaultDate={addingFor === "new" ? "" : addingFor}
          // Keep the activity date inside the trip date range.
          minDate={startKey}
          maxDate={endKey}
          onClose={() => setAddingFor(null)}
        />
      )}
    </>
  );
}

export default Activities;
