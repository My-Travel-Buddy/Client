// api/client.js

// Handles requests from the frontend to the backend.
// request() keeps the shared fetch setup in one place.

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },

    // Send the login cookie with the request.
    credentials: "include",

    ...options,
  });

  // Show the backend error if the request fails.
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));

    const error = new Error(body.error || `Request failed (${res.status})`);

    // Keep the status code so it can be checked later.
    error.status = res.status;

    throw error;
  }

  // Return nothing when the backend sends no content.
  if (res.status === 204) {
    return null;
  }

  return res.json();
}

// --------------------------------------------------
// AI
// --------------------------------------------------

// Send trip details to the backend to generate an itinerary.
export function generateItinerary(tripData) {
  return request("/trips/itinerary", {
    method: "POST",
    body: JSON.stringify(tripData),
  });
}

// --------------------------------------------------
// VISA
// --------------------------------------------------

// Get the passport and destination country lists.
export function getVisaCountries() {
  return request("/trips/visa/countries");
}

// Check visa requirements for a passport and destination.
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

// Save a new activity for a trip.
export function createActivity(tripId, activityData) {
  return request(`/trips/${tripId}/activities`, {
    method: "POST",
    body: JSON.stringify(activityData),
  });
}

// Delete an activity from a trip.
export function deleteActivity(tripId, activityId) {
  return request(`/trips/${tripId}/activities/${activityId}`, {
    method: "DELETE",
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
// Save the itinerary before going to login
// --------------------------------------------------

export async function saveItinerary(itinerary) {
  if (itinerary.budget < 0) {
    throw new Error("Enter budget as minimum 0");
  }

  const savedTrip = await createTrip({
    destination: itinerary.destination,
    date_Range: [itinerary.startDate, itinerary.endDate],
    budget: itinerary.budget,
    summary: itinerary.summary,
  });

  const tripId = savedTrip.id;

  // Save all generated activities.
  for (const activity of itinerary.activities || []) {
    await createActivity(tripId, {
      title: activity.title,
      category: activity.category,
      dateTime: activity.dateTime,
      estimatedCost: activity.estimatedCost,
      notes: activity.notes,
    });
  }

  // Save all generated checklist items.
  for (const item of itinerary.checklist || []) {
    await createChecklistItem(tripId, {
      text: item.text,
      completed: item.completed,
    });
  }

// ADDED: toggle or edit one checklist item.
// Note the unusual path shape — the item id sits BETWEEN the trip id and the
// word "checklist" (see Server/routes/checklist.routes.js). It is inconsistent
// with the other routes, but changing a shared route is a team decision, so
// the client matches the server as it stands.
export function updateChecklistItem(tripId, itemId, changes) {
  return request(`/trips/${tripId}/${itemId}/checklist/edit`, {
    method: "PATCH",
    body: JSON.stringify(changes),
  });
}

// ADDED: delete one checklist item.
// The server route is DELETE /trips/:id/checklist/delete, where :id is the
// CHECKLIST ITEM id, not the trip id. The answer is 204 with no body, so
// request() resolves to null.
export function deleteChecklistItem(itemId) {
  return request(`/trips/${itemId}/checklist/delete`, {
    method: "DELETE",
  });
}
