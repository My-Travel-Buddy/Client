// src/pages/HomePage.jsx

import { useState } from "react";
import { useNavigate } from "react-router";
import RenderingTrips from "../components/harcodedTrips";
import { generateItinerary } from "../api/client";

// To support the cycling hero photos, I load all desktop WebP images
// as URLs, sort them by filename, and store them in an array.
// The hero rotation logic then cycles through this array.
const HERO_IMAGES = Object.entries(
  import.meta.glob("../assets/travel-auth-backgrounds/desktop-webp/*.webp", {
    eager: true, //loads the images immediately.
    query: "?url", //returns each image’s browser-ready URL.
    import: "default", //returns only the default exported URL.
  }),
)
  .sort(([pathA], [pathB]) => pathA.localeCompare(pathB))
  .map(([, url]) => url);

// What the traveller can pick from. The label is what gets sent to Gemini,
// so it doubles as the wording of the request.
const INTERESTS = [
  { label: "Culture & History", icon: "🏛️" },
  { label: "Food & Culinary", icon: "🍜" },
  { label: "Nature & Outdoors", icon: "🏞️" },
  { label: "Shopping", icon: "🛍️" },
  { label: "Cozy Cafes", icon: "☕" },
  { label: "Art & Architecture", icon: "🎨" },
  { label: "Photography hotspots", icon: "📷" },
  { label: "Nightlife", icon: "🌃" },
];

export default function HomePage() {
  const navigate = useNavigate();

  // Pick a random hero image when the page loads.
  // useState keeps the same image while the user fills out the form.
  const [hero] = useState(
    () => HERO_IMAGES[Math.floor(Math.random() * HERO_IMAGES.length)],
  );

  // Store the trip form values.
  const [formData, setFormData] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    budget: "",
    interests: [],
  });

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

  // Add or remove an interest when the user clicks it.
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
      };

      const data = await generateItinerary(tripData);
      console.log("AI RESPONSE:", data);
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
          backgroundImage: `url(${hero})`,
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
              required
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
                required
                value={formData.startDate}
                onChange={handleChange}
              />

              <input
                id="endDate"
                name="endDate"
                type="date"
                required
                value={formData.endDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-field budget-field">
            <label htmlFor="budget">BUDGET ESTIMATE</label>

            {/* Match backend budget rules: required, positive, two decimals,
                and within DECIMAL(10,2). Server validation remains the final guard. */}

            <input
              id="budget"
              name="budget"
              type="number"
              min="1"
              max="99999999"
              step="0.01"
              required
              placeholder="e.g. 2500"
              value={formData.budget}
              onChange={handleChange}
            />
          </div>

          <div className="interests-section">
            <span className="interests-label">Interests &amp; Activities</span>

            <div className="interest-options">
              {INTERESTS.map((interest) => (
                <button
                  key={interest.label}
                  type="button"
                  onClick={() => handleInterestClick(interest.label)}
                  className={`interest-pill ${
                    formData.interests.includes(interest.label)
                      ? "selected"
                      : ""
                  }`}
                >
                  <span className="interest-icon" aria-hidden="true">
                    {interest.icon}
                  </span>

                  {interest.label}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className="generate-button">
            {loading ? "Generating..." : "Generate Dream Plan"}
          </button>
        </form>

        {message && <p className="form-message">{message}</p>}

        <section className="popular-section">
          <h2>Popular Destinations</h2>
          <RenderingTrips setFormData={setFormData} />
        </section>
      </main>
    </>
  );
}
