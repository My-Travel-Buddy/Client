import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import axios from "axios";
import Activities from "../components/Activities";
import Checklist from "../components/Checklist";
import Documents from "../components/Documents";
import TripCalendar from "../components/Calendar";
import Overview from "../components/overview";

// List of tabs shown on the trip details page.
const SECTIONS = [
  "Overview",
  "Itinerary",
  "Documents",
  "Checklist",
  "Activities",
];

// Backend API URL.
const BACKEND_API = import.meta.env.VITE_API_URL;

// Show the details for one trip using the id from the URL.
export default function TripDetails() {
  const { id } = useParams();

  const [trip, setTrip] = useState(null);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("Overview");

  // Get the trip when the page opens or the id changes.
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
  if (!trip) return <p>Loading…</p>; // Show loading until the trip arrives.

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
      <p>Budget: ${trip.budget}</p>
      <div className="trip-tabs" role="tablist" aria-label="Trip sections">
        {SECTIONS.map((section) => (
          <button
            key={section}
            type="button"
            role="tab"
            aria-selected={activeSection === section}
            className={`trip-tab ${activeSection === section ? "active" : ""}`}
            onClick={() => setActiveSection(section)}
          >
            {section}
          </button>
        ))}
      </div>

      {activeSection === "Overview" && <Overview trip={trip}/>}

      {/* Show the calendar inside the Itinerary tab. */}
      {activeSection === "Itinerary" && (
        <div className="tab-panel">
          <TripCalendar tripId={trip.id} />
        </div>
      )}
      {activeSection === "Documents" && <Documents trip={trip} />}
      {activeSection === "Checklist" && (
        <Checklist trip={trip} setTrip={setTrip} />
      )}
      {activeSection === "Activities" && (
        <Activities trip={trip} setTrip={setTrip} />
      )}
    </section>
  );
}
