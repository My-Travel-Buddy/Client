import { useState } from "react";
import ActivityEdit from "./ActivityEdit";
import { deleteActivity } from "../api/client";

function Activities({ trip, setTrip }) {
  // Is the "Add New Activity" pop-up open?
  const [showForm, setShowForm] = useState(false);

  async function handleDelete(activity) {
    // Deleting cannot be undone, so ask first.
    const confirmed = window.confirm(`Delete "${activity.title}"?`);

    if (!confirmed) {
      return;
    }

    try {
      await deleteActivity(trip.id, activity.id);

      // Take it off the screen without reloading the trip.
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

        <button
          type="button"
          className="add-activity-button"
          onClick={() => setShowForm(true)}
        >
          + Add Activity
        </button>
      </div>

      {/* A named wrapper, so the CSS can target these cards by class instead
          of guessing from the markup shape. */}
      <div className="activities-grid">
        {trip.Activities.map((activity, index) => (
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
            <li> Category: {activity.category} </li>
            <li>
              {" "}
              When:{" "}
              {new Date(activity.dateTime).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })}
            </li>
              <li>Cost: ${activity.estimatedCost}</li>
            </ul>
          </div>
        ))}
      </div>

      {showForm && (
        <ActivityEdit
          trip={trip}
          setTrip={setTrip}
          onClose={() => setShowForm(false)}
        />
      )}
    </>
  );
}

export default Activities;

/* ============================================================
   REMOVED in commit 373b5d4.
   Kept here rather than inline: these came out of JSX markup,
   where a // line would RENDER ON THE PAGE instead of being a
   comment. Listed so nothing is missing.
   ============================================================
   ---------- removed block ----------
   import TripCalendar from "./Calendar";
   ---------- removed block ----------
   function Activities({ trip }) {
     console.log(trip.Activities);
   ---------- removed block ----------
         <div>Activities</div>
         {trip.Activities.map((activity, index) => (
           <div key={index}>
   ---------- removed block ----------
               <li>
                   Cost: ${activity.estimatedCost}
               </li>
             </ul>
             <br />
           </div>
         ))}
   ============================================================ */
