import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import axios from "axios";
import Activities from "../components/Activities";
import Checklist from "../components/Checklist";
import Documents from "../components/Documents";
import TripCalendar from "../components/Calendar";

// The API base URL never changes while the app is running, so it lives
// outside the component.
const BACKEND_API = import.meta.env.VITE_API_URL;

// Shows one task. The id comes from the URL, e.g. /tasks/3 -> id === "3".
export default function TripDetails() {
  const { id } = useParams();

  const [trip, setTrip] = useState(null);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("Overview");

  // Fetch whenever the id in the URL changes. The `active` flag ignores a
  // response that arrives after we've already navigated away.
  useEffect(() => {
    const getTrip = async () => {
      try {
        const response = await axios.get(`${BACKEND_API}/trips/${id}`, {
  withCredentials: true,
});
        const data = await response.data;
        setTrip(data);
      } catch (err) {
        setError(
          err.response?.data?.message || err.message || "Failed to load trips",
        );
      }
    };
    getTrip();
  }, [id]);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!trip) return <p>Loading…</p>; // no task yet = still loading

  // function showItinerary(){
  //   return(

  //   )
  // }
  return (
    <section>
      <Link to="/trips" className="text-sm text-(--accent)">
        ← Back to All Trips
      </Link>
      <h1 className="mt-4 text-3xl font-semibold text-(--text-h)">
        {trip.destination}
        {/* {console.log(trip.Activities)} */}
      </h1>
      <p>
        {trip.date_Range[0].value} -to- {trip.date_Range[1].value}
      </p>
      <p>
        Budget: ${trip.budget}
      </p>
      <div>
        <button
          type="button"
          className="mr-3"
          onClick={() => setActiveSection("Overview")}
        >
          Overview
        </button>
        <button
          type="button"
          className="m-3"
          onClick={() => setActiveSection("Itinerary")}
        >
          Itinerary
        </button>
        <button
          type="button"
          className="m-3"
          onClick={() => setActiveSection("Documents")}
        >
          Documents
        </button>
        <button
          type="button"
          className="m-3"
          onClick={() => setActiveSection("Checklist")}
        >
          Checklist
        </button>
        <button
          type="button"
          className="m-3"
          onClick={() => {
            setActiveSection("Activities");
          }}
        >
          Activities
        </button>
      </div>

      {activeSection === 'Overview'}

      {/* The calendar brings no card of its own, so it gets one here — that
          way Itinerary, Documents and Checklist all sit on the same panel. */}
      {activeSection === 'Itinerary' && (
        <div className="tab-panel">
          <TripCalendar tripId={trip.id} />
        </div>
      )}
      {activeSection === 'Documents' && <Documents trip={trip} />}
      {activeSection === 'Checklist' && <Checklist trip={trip} setTrip={setTrip} />}
      {activeSection === "Activities" && (
        <Activities trip={trip} setTrip={setTrip} />
      )}
    </section>
  );
}

/* <p className='mt-2'>{trip.description || 'No description.'}</p> */
/* Status: {task.completed ? '✅ Done' : '⬜ Not done'} */
