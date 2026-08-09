import { useEffect, useState } from "react";
import Calendar from "@toast-ui/react-calendar";
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
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const getActivities = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/trips/${tripId}/activities`
        );

        const data = await response.json();

        const formattedEvents = data.map((activity) => ({
          id: String(activity.id),
          calendarId: "1",
          title: activity.title,
          category: "time",
          start: activity.start_date,
          end: activity.end_date,
        }));

        setEvents(formattedEvents);
      } catch (error) {
        console.error("Error fetching activities:", error);
      }
    };

    getActivities();
  }, [tripId]);

  const handleClickEvent = (event) => {
    console.log("Clicked event:", event);
    setSelectedEvent(event);
  };

  return (
    <div>
      <Calendar
        height="700px"
        view="month"
        calendars={calendars}
        events={events}
        usageStatistics={false}
        onClickEvent={handleClickEvent}
      />

      {selectedEvent && (
        <div>
          <h2>{selectedEvent.title}</h2>

          <p>
            Start: {selectedEvent.start.toString()}
          </p>

          <p>
            End: {selectedEvent.end.toString()}
          </p>

          <button onClick={() => setSelectedEvent(null)}>
            Close
          </button>
        </div>
      )}
    </div>
  );
}