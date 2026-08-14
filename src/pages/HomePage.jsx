// src/pages/HomePage.jsx

import { useState } from "react";
import { useNavigate } from "react-router";
import RenderingTrips from "../components/harcodedTrips"
import { getVisaRequirements } from "../api/client";
import heroImage from "../assets/hero.png";
import { generateItinerary } from "../api/client";
import Checklist from "../components/Checklist";

export default function HomePage() {
  const navigate = useNavigate();

  // Store the trip form values.
  const [formData, setFormData] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    budget: "",
    interests: [],
    checklist: [],
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
        interests: formData.interests,
         checklist: formData.checklist
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
  <>
    <section
      className="home-hero"
      style={{
        backgroundImage: `url(${heroImage})`,
      }}
    >
      <div className="hero-overlay">
        <div className="hero-content">
          <h1>Plan Your Next Adventure with AI</h1>

          <p>
            Discover personalized itineraries, dynamic budget insights, and
            real-time travel coordination in one seamless companion designed
            for travelers.
          </p>
        </div>
      </div>
    </section>

    <main className="home-main">
      <form onSubmit={handleGenerate} className="trip-form">
        <div className="form-field destination-field">
          <label htmlFor="destination">DESTINATION</label>

          <input
            id="destination"
            name="destination"
            placeholder="Where do you want to go?"
            value={formData.destination}
            onChange={handleChange}
          />
        </div>

        <div className="form-field dates-field">
          <label>DATES</label>

          <div className="date-inputs">
            <input
              id="startDate"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
            />

            <input
              id="endDate"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-field budget-field">
          <label htmlFor="budget">BUDGET ESTIMATE</label>

          <input
            id="budget"
            name="budget"
            placeholder= "0-100000"
            value={formData.budget}
            onChange={handleChange}
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
          className="generate-button"
        >
          {loading ? "Generating..." : "Generate Dream Plan"}
        </button>
      </form>

      {message && <p className="form-message">{message}</p>}

      <section className="popular-section">
        <h2>Popular Destinations</h2>
        <RenderingTrips />
      </section>
    </main>
  </>
);
}
