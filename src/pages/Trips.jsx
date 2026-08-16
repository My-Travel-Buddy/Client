import { useEffect, useState } from "react";
import { Link } from "react-router";
import { request } from "../api/client";

export default function Trips({ user }) {
  // The name for the greeting. `user` is null for a moment while App checks
  // the login cookie, and stays null when nobody is logged in.
  const name = user?.username || user?.name || user?.email || "traveler";

  // Store the saved trips returned by the backend.
  const [trips, setTrips] = useState([]);

  // Track whether the trips are still loading.
  const [loading, setLoading] = useState(true);

  // Store an error message if the request fails.
  const [error, setError] = useState("");

  // Load all saved trips when this page first opens.
  useEffect(() => {
    async function getTrips() {
      try {
        // client.js sends GET /trips to the backend.
        const data = await request("/trips");

        // The backend returns an array of saved trips.
        setTrips(data);
      } catch (error) {
        setError(error.message);
      }

      setLoading(false);
    }

    getTrips();
  }, []);

  // Show a loading message while waiting for the backend.
  if (loading) {
    return <p>Loading trips...</p>;
  }

  // Show an error if the request failed.
  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
  <>
      <div className="trips-header">
        <div>
          <h1>Welcome back, {name}! 👋</h1>

          <p>Your upcoming travel plans, customized itineraries, and checklist.</p>
        </div>

        <Link to="/" className="plan-trip-button">
          + Plan a New Trip
        </Link>
      </div>

      <h2 className="trips-section-title">My Upcoming Itineraries</h2>

    <section className='text-center'>
      {/* Show an empty state if the user has no saved trips. */}
      {trips.length === 0 ? (
        <div className="trips-empty">
          <div className="trips-empty-icon">🧭</div>

          <h3>No trips saved yet</h3>

          <p>
            Generate an itinerary from the home page and save it — it will
            show up here.
          </p>

          <Link to="/" className="plan-trip-button">
            Plan your first trip
          </Link>
        </div>
      ) : (
        <div className="space-y-4">

          {/* Create one card for every saved trip. */}
          {trips.map((trip) => (
            <Link
              key={trip.id}
              to={`/trips/${trip.id}`}
              className="block rounded-md border bg-white p-4"
            >
              <h2 className="text-xl font-semibold">
                {trip.destination}
              </h2>

              {/* The backend stores budget as a min/max range. */}
              <p>
                Budget: ${trip.budget}
              </p>

              {/* The backend stores the trip dates as a date range. */}
              <p>
                Start Date: {trip.date_Range[0].value}
              </p>

              <p>
                End Date: {trip.date_Range[1].value}
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  </>
  );
}