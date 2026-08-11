import { useEffect, useState } from "react";
import { Link } from "react-router";
import { request } from "../api/client";

export default function Trips() {
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
    <section className="mx-auto max-w-3xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          My Trips
        </h1>

        {/* Go back to the Home page to create another trip. */}
        <Link
          to="/"
          className="rounded-md bg-blue-600 px-4 py-2 text-white"
        >
          + Plan New Trip
        </Link>
      </div>

      {/* Show a message if the user has no saved trips. */}
      {trips.length === 0 ? (
        <p>No saved trips yet.</p>
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
                Budget: ${trip.budget[0].value}
                {" - $"}
                {trip.budget[1].value}
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
  );
}