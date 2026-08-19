import { useEffect, useRef, useState } from "react";
import Calendar from "@toast-ui/calendar";
import "@toast-ui/calendar/dist/toastui-calendar.min.css";

const calendars = [
  {
    id: "1",
    name: "Activities",
    backgroundColor: "#03bd9e",
    borderColor: "#03bd9e",
  },
];

export default function TripCalendar({ tripId }) {
  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [currentMonth, setCurrentMonth] = useState("");
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [editActivity, setEditActivity] = useState(false);
  const [editActivityForm, setEditActivityForm] = useState({
    id: "",
    title: "",
    category: "",
    dateTime: "",
    estimatedCost: "",
    notes: "",
  });
  const [activityForm, setActivityForm] = useState({
    title: "",
    category: "",
    dateTime: "",
    estimatedCost: "",
    notes: "",
  });

  const category = [
    "Food",
    "Sightseeing",
    "Culture",
    "Adventure",
    "Shopping",
    "Transportation",
    "Entertainment",
    "Other",
  ];

  // ---------- REMOVED in commit 373b5d4 ----------
  const handleOpenAddActivity = () => {
    setActivityForm({
      title: "",
      category: "",
      dateTime: "",
      estimatedCost: "",
      notes: "",
    });

    setShowAddActivity(true);
  };

  // ---------- end removed ----------
  const calendarElement = useRef(null);
  const calendarInstance = useRef(null);

  // Update the month displayed above the calendar
  const updateMonthTitle = (calendar) => {
    try {
      const tuiDate = calendar.getDate();

      // TOAST UI returns its own date object
      const date = tuiDate.toDate();

      setCurrentMonth(
        date.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
      );
    } catch (error) {
      console.error("Error updating month:", error);
    }
  };

  // Create calendar
  useEffect(() => {
    if (!calendarElement.current) return;

    const calendar = new Calendar(calendarElement.current, {
      defaultView: "month",
      usageStatistics: false,
      calendars: calendars,

      month: {
        startDayOfWeek: 0,
        isAlways6Weeks: false,
      },
    });

    calendarInstance.current = calendar;

    // Display the current month
    updateMonthTitle(calendar);

    // When an existing activity is clicked
    calendar.on("clickEvent", (event) => {
      console.log("Clicked activity:", event.event);

      if (event.event.raw) {
        setSelectedActivity(event.event.raw);
      }
    });

    // When an empty date is clicked
    calendar.on("selectDateTime", (event) => {
      const date = event.start;

      setActivityForm({
        title: "",
        category: "",
        dateTime: date.toISOString().slice(0, 16),
        estimatedCost: "",
        notes: "",
      });
      setShowAddActivity(true);
    });

    return () => {
      calendar.destroy();
      calendarInstance.current = null;
    };
  }, []);

  const getActivities = async () => {
    const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
    try {
      const response = await fetch(`${BASE_URL}/trips/${tripId}/activities`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch activities");
      }

      const data = await response.json();

      console.log("Activities from database:", data);

      const formattedEvents = data
        .filter((activity) => activity.dateTime)
        .map((activity) => ({
          id: String(activity.id),
          calendarId: "1",
          title: activity.title,
          category: "time",

          start: activity.dateTime,

          end: new Date(new Date(activity.dateTime).getTime() + 60 * 60 * 1000),

          body: activity.notes || "",

          raw: activity,
        }));

      console.log("Calendar events:", formattedEvents);

      if (calendarInstance.current) {
        calendarInstance.current.clear();

        calendarInstance.current.createEvents(formattedEvents);

        if (formattedEvents.length > 0) {
          const firstActivityDate = new Date(formattedEvents[0].start);

          console.log("Moving calendar to:", firstActivityDate);

          calendarInstance.current.setDate(firstActivityDate);

          updateMonthTitle(calendarInstance.current);
        }
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  useEffect(() => {
    if (tripId) {
      getActivities();
    }
  }, [tripId]);

  async function addActivities() {
    const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
    console.log("Sending activity:", activityForm);
    const response = await fetch(`${BASE_URL}/trips/${tripId}/activities`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(activityForm),
    });

    if (!response.ok) {
      alert("Failed to add activity.");
      console.log(await response.text());
      return;
    }
    await getActivities();
  }

  async function editActivities() {
    const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
    const response = await fetch(
      `${BASE_URL}/${tripId}/activities/${editActivityForm.id}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editActivityForm),
      },
    );

    if (!response.ok) {
      alert("Failed to add update activity.");
      console.log(await response.text());
      return;
    }
    const updatedActivity = await response.json();

    setEditActivity(false);
    await getActivities();
    setSelectedActivity(updatedActivity);
  }
  async function deleteActivities() {
    const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
    const response = await fetch(
      `${BASE_URL}/trips/${tripId}/activities/${selectedActivity.id}`,
      {
        method: "DELETE",
        credentials: "include",
      },
    );

    if (!response.ok) {
      alert("Failed to delete activity.");
      console.log(await response.text());
      return;
    }
    alert("You deleted this activity.");
    setEditActivity(false);
    setSelectedActivity(null);
    await getActivities();
  }

  function handleEdit() {
    setEditActivityForm({
      id: selectedActivity.id,
      title: selectedActivity.title,
      category: selectedActivity.category,
      dateTime: selectedActivity.dateTime,
      estimatedCost: selectedActivity.estimatedCost,
      notes: selectedActivity.notes,
    });
    setSelectedActivity(null);
    setEditActivity(true);
  }

  const handlePreviousMonth = () => {
    if (!calendarInstance.current) return;

    calendarInstance.current.prev();

    updateMonthTitle(calendarInstance.current);
  };

  const handleNextMonth = () => {
    if (!calendarInstance.current) return;

    calendarInstance.current.next();

    updateMonthTitle(calendarInstance.current);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "15px",
        }}
      >
        <button onClick={handlePreviousMonth}>Previous</button>

        <h2 style={{ margin: 0 }}>{currentMonth}</h2>

        <button onClick={handleNextMonth}>Next</button>
      </div>

      <div
        ref={calendarElement}
        style={{
          width: "100%",
          height: "850px",
        }}
      />

      {selectedActivity && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 99999,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              color: "black",
              padding: "30px",
              borderRadius: "12px",
              width: "400px",
              maxWidth: "90%",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
            }}
          >
            {/* Close */}
            <button
              onClick={() => setSelectedActivity(null)}
              style={{
                float: "right",
                background: "transparent",
                border: "none",
                color: "black",
                fontSize: "24px",
                cursor: "pointer",
              }}
            >
              ×
            </button>

            <h2>{selectedActivity.title}</h2>

            <p>
              <strong>Category:</strong> {selectedActivity.category}
            </p>

            {selectedActivity.dateTime && (
              <>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(selectedActivity.dateTime).toLocaleDateString()}
                </p>

                <p>
                  <strong>Time:</strong>{" "}
                  {new Date(selectedActivity.dateTime).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </>
            )}

            {selectedActivity.estimatedCost && (
              <p>
                <strong>Estimated Cost:</strong> $
                {Number(selectedActivity.estimatedCost).toFixed(2)}
              </p>
            )}

            {selectedActivity.notes && (
              <div>
                <strong>Notes:</strong>
                <p>{selectedActivity.notes}</p>
              </div>
            )}
            <button
              onClick={() => {
                setActivityForm({
                  title: "",
                  category: "",
                  dateTime: selectedActivity.dateTime
                    ? new Date(selectedActivity.dateTime)
                        .toISOString()
                        .slice(0, 16)
                    : "",
                  estimatedCost: "",
                  notes: "",
                });
                setSelectedActivity(null);
                setShowAddActivity(true);
              }}
              style={{
                float: "right",
                color: "black",
                fontSize: "15px",
                cursor: "pointer",
              }}
            >
              Add Activity
            </button>

            <button
              onClick={deleteActivities}
              style={{
                marginLeft: "55px",
                color: "black",
                fontSize: "15px",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "red")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "black")}
            >
              Delete
            </button>

            <button
              onClick={handleEdit}
              style={{
                float: "left",
                color: "black",
                fontSize: "15px",
                cursor: "pointer",
              }}
            >
              Edit
            </button>
          </div>
        </div>
      )}
      {editActivity && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 99999,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              color: "black",
              padding: "30px",
              borderRadius: "12px",
              width: "400px",
              maxWidth: "90%",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
            }}
          >
            {/* Close */}
            <button
              onClick={() => setEditActivity(false)}
              style={{
                float: "right",
                background: "transparent",
                border: "none",
                color: "black",
                fontSize: "24px",
                cursor: "pointer",
              }}
            >
              ×
            </button>
            <h2>Edit activity</h2>

            <input
              type="text"
              placeholder="activity title"
              value={editActivityForm.title}
              onChange={(e) =>
                setEditActivityForm({
                  ...editActivityForm,
                  title: e.target.value,
                })
              }
            />
            <select
              value={editActivityForm.category}
              onChange={(e) =>
                setEditActivityForm({
                  ...editActivityForm,
                  category: e.target.value,
                })
              }
            >
              <option value="">select a category</option>
              {category.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <input
              type="datetime-local"
              value={editActivityForm.dateTime}
              onChange={(e) =>
                setEditActivityForm({
                  ...editActivityForm,
                  dateTime: e.target.value,
                })
              }
            />
            <input
              type="number"
              placeholder="Estimated cost"
              value={editActivityForm.estimatedCost}
              onChange={(e) =>
                setEditActivityForm({
                  ...editActivityForm,
                  estimatedCost: e.target.value,
                })
              }
            />
            <input
              type="text"
              placeholder="notes..."
              value={editActivityForm.notes}
              onChange={(e) =>
                setEditActivityForm({
                  ...editActivityForm,
                  notes: e.target.value,
                })
              }
            />

            <button
              onClick={editActivities}
              style={{
                float: "right",
                color: "black",
                fontSize: "15px",
                cursor: "pointer",
              }}
            >
              Confirm edits
            </button>
            <button
              onClick={() => setEditActivity(false)}
              style={{
                float: "left",
                color: "black",
                fontSize: "15px",
                cursor: "pointer",
              }}
            >
              cancel
            </button>
          </div>
        </div>
      )}

      {showAddActivity && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 99999,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              color: "black",
              padding: "30px",
              borderRadius: "12px",
              width: "400px",
              maxWidth: "90%",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
            }}
          >
            {/* Close */}
            <button
              onClick={() => setShowAddActivity(false)}
              style={{
                float: "right",
                background: "transparent",
                border: "none",
                color: "black",
                fontSize: "24px",
                cursor: "pointer",
              }}
            >
              ×
            </button>

            <h2>Add activity</h2>

            <input
              type="text"
              placeholder="activity title"
              value={activityForm.title}
              onChange={(e) =>
                setActivityForm({
                  ...activityForm,
                  title: e.target.value,
                })
              }
            />
            <select
              value={activityForm.category}
              onChange={(e) =>
                setActivityForm({
                  ...activityForm,
                  category: e.target.value,
                })
              }
            >
              <option value="">select a category</option>
              {category.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <input
              type="datetime-local"
              value={activityForm.dateTime}
              onChange={(e) =>
                setActivityForm({
                  ...activityForm,
                  dateTime: e.target.value,
                })
              }
            />
            <input
              type="number"
              placeholder="Estimated cost"
              value={activityForm.estimatedCost}
              onChange={(e) =>
                setActivityForm({
                  ...activityForm,
                  estimatedCost: e.target.value,
                })
              }
            />
            <input
              type="text"
              placeholder="notes..."
              value={activityForm.notes}
              onChange={(e) =>
                setActivityForm({
                  ...activityForm,
                  notes: e.target.value,
                })
              }
            />

            <button
              onClick={addActivities}
              style={{
                float: "right",
                color: "black",
                fontSize: "15px",
                cursor: "pointer",
              }}
            >
              Add Activity
            </button>
            <button
              onClick={() => setShowAddActivity(false)}
              style={{
                float: "left",
                color: "black",
                fontSize: "15px",
                cursor: "pointer",
              }}
            >
              cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
