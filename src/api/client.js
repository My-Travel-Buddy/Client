// api/client.js — the one place that talks to the backend.
// Every API call goes through request(), so shared logic (base URL, headers,
// error handling) lives in ONE spot instead of being copy-pasted everywhere.

// Where the backend lives. In dev it's your local Express server; in production
// set VITE_API_URL to your deployed backend URL. Vite only exposes vars that
// start with VITE_, and reads them at build time.

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Shared request function
export async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
    },

    credentials: "include",

    ...options,
  });

  // fetch does not throw for 400 or 500 responses,
  // so we check the status ourselves.
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));

    throw new Error(body.error || `Request failed (${res.status})`);
  }

  // DELETE routes may return no JSON.
  if (res.status === 204) {
    return null;
  }

  return res.json();
}

// AI
export function generateItinerary(tripData) {
  return request("/api/ai/itinerary", {
    method: "POST",

    body: JSON.stringify(tripData),
  });
}

// Trips
export function createTrip(tripData) {
  return request("/trips/post", {
    method: "POST",

    body: JSON.stringify(tripData),
  });
}

// Activities
export function createActivity(tripId, activityData) {
  return request(`/trips/${tripId}/activities`, {
    method: "POST",

    body: JSON.stringify(activityData),
  });
}
// Checklist
export function createChecklistItem(tripId, item) {
  return request(`/trips/${tripId}/checklist/post`, {
    method: "POST",

    body: JSON.stringify({
      item,
    }),
  });
}
