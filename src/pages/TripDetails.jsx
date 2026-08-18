import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import axios from "axios";
import Activities from "../components/Activities";
import Checklist from "../components/Checklist";
import TripCalendar from "../components/Calendar";
import Overview from "../components/overview";
// Shows one task. The id comes from the URL, e.g. /tasks/3 -> id === "3".
export default function TripDetails() {
  const { id } = useParams();

  const [trip, setTrip] = useState(null);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("Overview");

  const BACKEND_API = import.meta.env.VITE_API_URL;

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

      {activeSection === 'Overview' && <Overview trip={trip}/>}
      {activeSection === 'Itinerary' && <TripCalendar tripId={trip.id} />}
      {activeSection === 'Documents'}
      {activeSection === 'Checklist' && <Checklist trip={trip} setTrip={setTrip} />}
      {activeSection === "Activities" && <Activities trip={trip} />}
    </section>
  );
}

/* <p className='mt-2'>{trip.description || 'No description.'}</p> */
/* Status: {task.completed ? '✅ Done' : '⬜ Not done'} */
