// api/client.js — the one place that talks to the backend.
// Every API call goes through request(), so shared logic (base URL, headers,
// error handling) lives in ONE spot instead of being copy-pasted everywhere.

// Where the backend lives. In dev it's your local Express server; in production
// set VITE_API_URL to your deployed backend URL. Vite only exposes vars that
// start with VITE_, and reads them at build time.
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include", // send cookies (needed once you add login/auth)
    ...options,
  });

  // fetch only throws on a network failure, so we check the HTTP status ourselves.
  if (!res.ok) {
    // Our backend sends errors as { error: "..." }. Fall back if it didn't.
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }

  // 204 No Content (e.g. after a DELETE) has no body to parse.
  if (res.status === 204) return null;
  return res.json();
}

// --------------------------------------------------
// AI
// --------------------------------------------------

// Ask Gemini to generate an itinerary.
export function generateItinerary(tripData) {
  return request("/trips/itinerary", {
    method: "POST",
    body: JSON.stringify(tripData),
  });
}

// --------------------------------------------------
// TRIPS
// --------------------------------------------------

// Save a new trip.
export function createTrip(tripData) {
  return request("/trips/post", {
    method: "POST",
    body: JSON.stringify(tripData),
  });
}

// --------------------------------------------------
// ACTIVITIES
// --------------------------------------------------

// Save an activity that belongs to a trip.
export function createActivity(tripId, activityData) {
  return request(`/trips/${tripId}/activities`, {
    method: "POST",
    body: JSON.stringify(activityData),
  });
}
// this give me GET /trips/travel-requirements
export function getTravelRequirements(destination, passportCountry) {
  const params = new URLSearchParams({
     destination,
     passportCountry
     });
     return request(
      `/trips/travel-requirements?${params.toString()}`
     );
}

// --------------------------------------------------
// CHECKLIST
// --------------------------------------------------

// Save a checklist item that belongs to a trip.
export function createChecklistItem(tripId, item) {
  return request(`/trips/${tripId}/checklist`, {
    method: "POST",
    body: JSON.stringify({
      item,
    }),
  });
}
