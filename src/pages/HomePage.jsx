// src/pages/HomePage.jsx

import { useState } from "react";

import {
  generateItinerary,
  createTrip,
  createActivity,
  createChecklistItem,
} from "../api/client";

export default function HomePage() {
  // Store the trip form values.
  const [formData, setFormData] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    budget: "",
    interests: "",
  });

  // Store the itinerary returned by Gemini.
  const [itinerary, setItinerary] = useState(null);

  // Used while Gemini is generating the itinerary.
  const [loading, setLoading] = useState(false);

  // Show success or error messages.
  const [message, setMessage] = useState("");

  // Update the correct form field when the user types.
  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  }

  // Generate the itinerary.
  async function handleGenerate(event) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      // Build the trip information we send to the backend.
      // formData is the React state object that stores the trip form values.
      const tripData = {
        destination: formData.destination,
        startDate: formData.startDate,
        endDate: formData.endDate,
        budget: formData.budget,

        // Turn "Food, Culture" into ["Food", " Culture"].
        interests: formData.interests.split(","),
      };

      // client.js sends POST /api/ai/itinerary.
      const data = await generateItinerary(tripData);

      // Store the generated itinerary so React can display it.
      setItinerary(data);
    } catch (error) {
      setMessage(error.message);
    }

    setLoading(false);
  }

  // Save the generated trip.
  async function handleSaveTrip() {
    if (!itinerary) {
      return;
    }

    try {
      setMessage("Saving trip...");

      // Save the main Trip first.
      const savedTrip = await createTrip({
        destination: itinerary.destination,

        date_Range: [
          itinerary.startDate,
          itinerary.endDate,
        ],

        budget: itinerary.budget,
      });

      // We need the TripId to connect activities
      // and checklist items to this trip.
      const tripId = savedTrip.id;

      // Save every generated activity.
      for (const activity of itinerary.activities) {
        await createActivity(tripId, {
          title: activity.title,
          category: activity.category,

          // dateTime is used later by the calendar.
          dateTime: activity.dateTime,

          estimatedCost: activity.estimatedCost,
          notes: activity.notes,
        });
      }

      // Save every generated checklist item.
      for (const item of itinerary.checklist) {
        await createChecklistItem(tripId, item);
      }

      setMessage("Trip saved successfully!");
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <section className="mx-auto max-w-2xl p-8">
      {/* Page heading */}
      <h1 className="mb-2 text-3xl font-bold">
        Plan Your Trip
      </h1>

      <p className="mb-6 text-gray-600">
        Enter your trip details and let My Travel Buddy
        create an itinerary for you.
      </p>

      {/* Trip form */}
      <form
        onSubmit={handleGenerate}
        className="space-y-4"
      >
        <div>
          <label
            htmlFor="destination"
            className="mb-1 block font-medium"
          >
            Destination
          </label>

          <input
            id="destination"
            name="destination"
            placeholder="Kyoto, Japan"
            value={formData.destination}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>

        <div>
          <label
            htmlFor="startDate"
            className="mb-1 block font-medium"
          >
            Start Date
          </label>

          <input
            id="startDate"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>

        <div>
          <label
            htmlFor="endDate"
            className="mb-1 block font-medium"
          >
            End Date
          </label>

          <input
            id="endDate"
            name="endDate"
            type="date"
            value={formData.endDate}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>

        <div>
          <label
            htmlFor="budget"
            className="mb-1 block font-medium"
          >
            Budget
          </label>

          <input
            id="budget"
            name="budget"
            placeholder="Moderate"
            value={formData.budget}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>

        <div>
          <label
            htmlFor="interests"
            className="mb-1 block font-medium"
          >
            Interests
          </label>

          <input
            id="interests"
            name="interests"
            placeholder="Food, Culture"
            value={formData.interests}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>

        {/* Generate button */}
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {loading
            ? "Generating..."
            : "Generate Itinerary"}
        </button>
      </form>

      {/* Success or error message */}
      {message && (
        <p className="mt-4">
          {message}
        </p>
      )}

      {/* Show the itinerary only after Gemini returns one. */}
      {itinerary && (
        <section className="mt-8">
          <h2 className="mb-2 text-2xl font-bold">
            {itinerary.title}
          </h2>

          <p className="mb-4 text-gray-600">
            {itinerary.summary}
          </p>

          {/* Tell the user when only part of a long trip was generated. */}
          {itinerary.hasMoreDays && (
            <p className="mb-4">
              Your trip is {itinerary.tripDays} days.
              We generated the first{" "}
              {itinerary.generatedDays} days.
            </p>
          )}

          {/* Generated activities */}
          <h3 className="mb-3 text-xl font-semibold">
            Activities
          </h3>

          <div className="space-y-4">
            {itinerary.activities.map(
              (activity, index) => (
                <div
                  key={index}
                  className="rounded-md border border-gray-200 bg-white p-4"
                >
                  <h4 className="mb-2 font-semibold">
                    Day {activity.day}:{" "}
                    {activity.title}
                  </h4>

                  <p>
                    Time: {activity.time}
                  </p>

                  <p>
                    Category: {activity.category}
                  </p>

                  <p>
                    Estimated Cost: $
                    {activity.estimatedCost}
                  </p>

                  <p className="mt-2">
                    {activity.notes}
                  </p>
                </div>
              )
            )}
          </div>

          {/* Generated checklist */}
          <h3 className="mb-2 mt-6 text-xl font-semibold">
            Checklist
          </h3>

          <ul className="list-disc pl-6">
            {itinerary.checklist.map(
              (item, index) => (
                <li key={index}>
                  {item}
                </li>
              )
            )}
          </ul>

          {/* Nothing is saved until the user clicks this button. */}
          <button
            type="button"
            onClick={handleSaveTrip}
            className="mt-6 rounded-md bg-green-600 px-4 py-2 text-white"
          >
            Save Trip
          </button>
        </section>
      )}
    </section>
  );
}