// src/pages/HomePage.jsx

import { useState } from "react";
import { useNavigate } from "react-router";
import RenderingTrips from "../components/harcodedTrips"
import { getVisaRequirements } from "../api/client";
import heroImage from "../assets/hero.png";
import { generateItinerary } from "../api/client";

export default function HomePage() {
  const navigate = useNavigate();

  // Store the trip form values.
  const [formData, setFormData] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    budget: "",
    interests: [],
  });

  const [visaInfo, setVisaInfo] = useState(null);
  async function handleVisaCheck() {
    const data = await getVisaRequirements("US", "CN");
    setVisaInfo(data);
  }

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

  // the function that validate the interest field
  function handleInterestClick(interest) {
    setFormData((previewsFormData) => {
      const isSelected = previewsFormData.interests.includes(interest);

      return {
        ...previewsFormData,
        interests: isSelected
          ? previewsFormData.interests.filter((item) => item !== interest)
          : [...previewsFormData.interests, interest],
      };
    });
  }

  // Generate the itinerary.
  async function handleGenerate(event) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    // console.log(formData.interests.join(", "))

    try {
      const tripData = {
        destination: formData.destination,
        startDate: formData.startDate,
        endDate: formData.endDate,
        budget: formData.budget,
        interests: formData.interests.split(","),
      };
      
      const data = await generateItinerary(tripData);
      console.log("AI RESPONSE:", data);

      setItinerary(data);
      console.log(data);

      navigate("/trips/itinerary", {
        state: { itinerary: { ...tripData, ...data } },
      });
    } catch (error) {
      setMessage(error.message);
    }

    setLoading(false);
  }

  return (
    <section
      className="mx-auto max-w-2xl bg-cover bg-center bg-no-repeat p-8"
      // style={{
      //   backgroundImage: `url(${heroImage})`,
      // }}
    >
      <h1 className="mb-2 text-3xl font-bold">Plan Your Trip</h1>

      <p className="mb-6 text-gray-600">
        Enter your trip details and let My Travel Buddy create an itinerary for
        you.
      </p>

      <form onSubmit={handleGenerate} className="space-y-4">
        <div>
          <label htmlFor="destination" className="mb-1 block font-medium">
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
          <label htmlFor="startDate" className="mb-1 block font-medium">
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
          <label htmlFor="endDate" className="mb-1 block font-medium">
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
          <label htmlFor="budget" className="mb-1 block font-medium">
            Budget
          </label>

          <input
            id="budget"
            name="budget"
            placeholder="0 - 1000000"
            value={formData.budget}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
        <div className="interests-section">
          <span className="interests-label">INTERESTS:</span>

          <div className="interest-options">
            {[
              "Food",
              "Sightseeing",
              "Culture",
              "Adventure",
              "Shopping",
              "Transportation",
              "Entertainment",
              "Other",
            ].map((interest) => (
              <button
                key={interest}
                type="button"
                onClick={() => handleInterestClick(interest)}
                className={`interest-pill ${
                  formData.interests.includes(interest) ? "selected" : ""
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Itinerary"}
        </button>
      </form>

      {message && <p className="mt-4">{message}</p>}

    </section>
    
  );
  

}
