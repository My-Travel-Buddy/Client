import { useEffect, useState } from "react";
import { getVisaRequirements, getVisaCountries } from "../api/client";

// Common country names people may type.
const ALIASES = {
  usa: "US",
  "u.s.": "US",
  "united states": "US",
  america: "US",
  uk: "GB",
  england: "GB",
  scotland: "GB",
  wales: "GB",
  britain: "GB",
  uae: "AE",
  emirates: "AE",
  vietnam: "VN",
  holland: "NL",
  czechia: "CZ",
  "south korea": "KR",
  korea: "KR",
  russia: "RU",
  turkiye: "TR",
};

// Find the country code from the trip destination.
function findCountryCode(destination, countries) {
  const text = String(destination || "").toLowerCase();

  // Check longer country names first.
  const sorted = [...countries].sort((a, b) => b.name.length - a.name.length);

  const match = sorted.find((country) =>
    text.includes(country.name.toLowerCase()),
  );

  // Return the country code if a match is found.
  if (match) {
    return match.code;
  }

  // If no official country name matches, try common names.
  const aliases = Object.keys(ALIASES).sort((a, b) => b.length - a.length);

  const alias = aliases.find((word) => text.includes(word));

  // Make sure the country exists in the API list.
  if (alias && countries.some((country) => country.code === ALIASES[alias])) {
    return ALIASES[alias];
  }

  // Return an empty value if no country is found.
  return "";
}

function Documents({ trip }) {
  // Store the passport and destination country lists.
  const [passports, setPassports] = useState([]);
  const [destinations, setDestinations] = useState([]);

  // Store the selected passport country.
  const [passportCode, setPassportCode] = useState("US");

  // Store the selected destination country.
  const [destinationCode, setDestinationCode] = useState("");

  // Store the visa information.
  const [visa, setVisa] = useState(null);

  // Track whether visa information is loading.
  const [loading, setLoading] = useState(false);

  // Store an error message if something goes wrong.
  const [message, setMessage] = useState("");

  // Load the country lists and find the trip destination.
  useEffect(() => {
    async function loadCountries() {
      try {
        const data = await getVisaCountries();

        setPassports(data.passports || []);
        setDestinations(data.destinations || []);

        // Try to match the trip destination to a country code.
        setDestinationCode(
          findCountryCode(trip.destination, data.destinations || []),
        );
      } catch (error) {
        setMessage(error.message);
      }
    }

    loadCountries();
  }, [trip.destination]);

  // Get visa information when the passport or destination changes.
  useEffect(() => {
    async function loadVisa() {
      // Do not make the request until a destination is selected.
      if (!destinationCode) {
        return;
      }

      setLoading(true);
      setMessage("");

      try {
        const data = await getVisaRequirements(passportCode, destinationCode);

        setVisa(data);
      } catch (error) {
        setMessage(error.message);
        setVisa(null);
      }

      setLoading(false);
    }

    loadVisa();
  }, [passportCode, destinationCode]);

  // Get the main visa rule from the response.
  const rule = visa?.data?.visa_rules?.primary_rule;

  // Get the destination information.
  const country = visa?.data?.destination;

  // Get any extra registration requirements.
  const registration = visa?.data?.mandatory_registration;

  // Check if the visa information came from Gemini.
  const fromGemini = visa?.source === "gemini";

  return (
    <div className="visa-panel">
      <h3>Travel Documents</h3>

      <p className="visa-intro">
        Visa requirements for this trip. Change the passport to check for
        another country.
      </p>

      <div className="visa-controls">
        <div className="visa-field">
          <label htmlFor="passport">My passport</label>

          <select
            id="passport"
            value={passportCode}
            onChange={(event) => setPassportCode(event.target.value)}
          >
            {/* Show all available passport countries. */}
            {passports.map((item) => (
              <option key={item.code} value={item.code}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="visa-field">
          <label htmlFor="destination">Destination</label>

          <select
            id="destination"
            value={destinationCode}
            onChange={(event) => setDestinationCode(event.target.value)}
          >
            <option value="">Choose a country</option>

            {/* Show all available destination countries. */}
            {destinations.map((item) => (
              <option key={item.code} value={item.code}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ask the user to choose a country if we could not find one. */}
      {!destinationCode && (
        <p className="visa-note">
          We could not tell which country "{trip.destination}" is in. Pick a
          destination above.
        </p>
      )}

      {/* Show while visa information is loading. */}
      {loading && <p className="visa-note">Checking visa rules...</p>}

      {/* Show an error message if the request fails. */}
      {message && <p className="visa-error">{message}</p>}

      {rule && !loading && (
        <>
          {/* Show the main visa requirement. */}
          <div className={`visa-banner visa-banner-${rule.color}`}>
            <strong>{rule.name}</strong>

            {rule.duration && <span>Stay up to {rule.duration}</span>}
          </div>

          {/* Show whether the information came from the visa API or Gemini. */}
          <div
            className={`visa-source ${
              fromGemini ? "visa-source-ai" : "visa-source-verified"
            }`}
          >
            <span className="visa-source-badge">{fromGemini ? "AI" : "✓"}</span>

            <div>
              <strong>
                {fromGemini
                  ? "AI-assisted travel guidance"
                  : "Verified travel-data guidance"}
              </strong>

              <p>
                {fromGemini
                  ? "We're providing preliminary guidance while we refresh our travel-document data. Please confirm current entry requirements with the destination's official immigration authority or embassy before departure.."
                  : "Information provided through our travel-document data service. Always confirm current requirements with an official government source before departure."}
              </p>
            </div>
          </div>

          {/* Show extra forms or registration requirements if needed. */}
          {registration && (
            <div className="visa-registration">
              <strong>Also required: {registration.name}</strong>

              {registration.link && (
                <a href={registration.link} target="_blank" rel="noreferrer">
                  Open the form
                </a>
              )}
            </div>
          )}

          {/* Show basic information about the destination. */}
          <ul className="visa-facts">
            <li>
              <span>Capital</span> {country?.capital}
            </li>

            <li>
              <span>Currency</span> {country?.currency} (
              {country?.currency_code})
            </li>

            <li>
              <span>Passport validity</span> {country?.passport_validity}
            </li>

            <li>
              <span>Phone code</span> {country?.phone_code}
            </li>

            <li>
              <span>Time zone</span> UTC {country?.timezone}
            </li>
          </ul>

          {/* Show the embassy link if one is available. */}
          {country?.embassy_url && (
            <a
              className="visa-embassy"
              href={country.embassy_url}
              target="_blank"
              rel="noreferrer"
            >
              Find the nearest embassy
            </a>
          )}
        </>
      )}
    </div>
  );
}

export default Documents;
