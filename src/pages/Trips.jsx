import { useEffect, useState } from "react";
import { Link } from "react-router";
import { request } from "../api/client";

export default function Trips({ user }) {
  // Get the user's name for the greeting.
  const name = user?.username || user?.name || user?.email || "traveler";

  // Store the saved trips.
  const [trips, setTrips] = useState([]);

  // Track whether trips are loading.
  const [loading, setLoading] = useState(true);

  // Store an error message.
  const [error, setError] = useState("");

  // Load saved trips when the page opens.
  useEffect(() => {
    async function getTrips() {
      try {
        // Get all saved trips from the backend.
        const data = await request("/trips");

        // Save the trips in state.
        setTrips(data);
      } catch (error) {
        setError(error.message);
      }

      setLoading(false);
    }

    getTrips();
  }, []);

  // Show a loading message.
  if (loading) {
    return <p>Loading trips...</p>;
  }

  // Show an error message.
  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <>
      <div className="trips-header">
        <div>
          <h1>Welcome back, {name}! 👋</h1>

          <p>
            Your upcoming travel plans, customized itineraries, and checklist.
          </p>
        </div>

        <Link to="/" className="plan-trip-button">
          + Plan a New Trip
        </Link>
      </div>

      <h2 className="trips-section-title">My Upcoming Itineraries</h2>

      <section className="text-center">
        {/* Show a message if there are no saved trips. */}
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
            {/* Show one card for each saved trip. */}
            {trips.map((trip) => (
              <Link
                key={trip.id}
                to={`/trips/${trip.id}`}
                className="block rounded-md border bg-white p-4"
              >
                <h2 className="text-xl font-semibold">{trip.destination}</h2>

                {/* Show the trip budget. */}
                <p>Budget: ${trip.budget}</p>

                {/* Show the trip start date. */}
                <p>Start Date: {trip.date_Range[0]?.value}</p>

                {/* Show the trip end date. */}
                <p>End Date: {trip.date_Range[1]?.value}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
