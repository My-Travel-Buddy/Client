// api/client.js

// This file is where the frontend sends requests to the backend.
// request() handles the common setup so we do not repeat it in every function.

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },

    // This sends the login cookie with the request.
    credentials: "include",

    ...options,
  });

  // If the backend returns an error, we get the message here.
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));

    const error = new Error(body.error || `Request failed (${res.status})`);

    // Save the status so we can check errors like 401.
    error.status = res.status;

    throw error;
  }

  // Some requests, like DELETE, may not return any data.
  if (res.status === 204) {
    return null;
  }

  return res.json();
}

// --------------------------------------------------
// AI
// --------------------------------------------------

// Send the trip information to the backend to generate the itinerary.
export function generateItinerary(tripData) {
  return request("/trips/itinerary", {
    method: "POST",
    body: JSON.stringify(tripData),
  });
}

// --------------------------------------------------
// VISA
// --------------------------------------------------

// Send the passport and destination codes to check visa requirements.
export function getVisaRequirements(passportCode, destinationCode) {
  return request("/trips/visa", {
    method: "POST",
    body: JSON.stringify({
      passportCode,
      destinationCode,
    }),
  });
}

// --------------------------------------------------
// TRIPS
// --------------------------------------------------

// Save a new trip in the database.
export function createTrip(tripData) {
  return request("/trips/post", {
    method: "POST",
    body: JSON.stringify(tripData),
  });
}

// --------------------------------------------------
// ACTIVITIES
// --------------------------------------------------

// Save a new activity for a trip.
export function createActivity(tripId, activityData) {
  return request(`/trips/${tripId}/activities`, {
    method: "POST",
    body: JSON.stringify(activityData),
  });
}

// --------------------------------------------------
// CHECKLIST
// --------------------------------------------------

// Save a new checklist item for a trip.
export function createChecklistItem(tripId, item) {
  return request(`/trips/${tripId}/checklist/post`, {
    method: "POST",
    body: JSON.stringify(item),
  });
}

// --------------------------------------------------
// To temporarily save the itinerary when navigating to login
// --------------------------------------------------

async function saveItinerary(itinerary) {
    if (itinerary.budget < 0) {
      throw new Error("Enter budget as minimum 0");
    }

    const savedTrip = await createTrip({
      destination: itinerary.destination,
      date_Range: [itinerary.startDate, itinerary.endDate],
      budget: itinerary.budget,
    });

    const tripId = savedTrip.id;

    // Save every generated activity.
    for (const activity of itinerary.activities || []) {
      await createActivity(tripId, {
        title: activity.title,
        category: activity.category,
        dateTime: activity.dateTime,
        estimatedCost: activity.estimatedCost,
        notes: activity.notes,
      });
    }

    // Save every generated checklist item.
    for (const item of itinerary.checklist || []) {
      await createChecklistItem(tripId, {
        text: item.text,
        completed: item.completed,
      });
    }
  }
