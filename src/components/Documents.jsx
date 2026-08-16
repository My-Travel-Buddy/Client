import { useEffect, useState } from "react";
import { getVisaRequirements, getVisaCountries } from "../api/client";

// Everyday shorthand the API's official names do not cover. The country LIST
// still comes from the API — these are just the nicknames people type.
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

// The trip destination is free text like "Paris, France", so we look for a
// country name inside it. Returns "" when we cannot tell.
function findCountryCode(destination, countries) {
  const text = String(destination || "").toLowerCase();

  // Longest name first, so "Dominican Republic" wins over "Dominica".
  const sorted = [...countries].sort((a, b) => b.name.length - a.name.length);

  const match = sorted.find((country) =>
    text.includes(country.name.toLowerCase()),
  );

  if (match) {
    return match.code;
  }

  // No official name in the text — try the nicknames. Longest first again, so
  // "united states" is tested before "usa".
  const aliases = Object.keys(ALIASES).sort((a, b) => b.length - a.length);

  const alias = aliases.find((word) => text.includes(word));

  // Only accept it if the API actually offers that country.
  if (alias && countries.some((country) => country.code === ALIASES[alias])) {
    return ALIASES[alias];
  }

  return "";
}

function Documents({ trip }) {
  // The two lists come from the API: countries that issue passports, and
  // places you can travel to. They are not the same list — Bermuda and Hong
  // Kong are destinations but do not appear under passports.
  const [passports, setPassports] = useState([]);
  const [destinations, setDestinations] = useState([]);

  // Which passport the traveller holds. They can change it.
  const [passportCode, setPassportCode] = useState("US");

  // Where they are going — filled in from the trip once the lists arrive.
  const [destinationCode, setDestinationCode] = useState("");

  const [visa, setVisa] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Load the country lists once, then guess this trip's destination.
  useEffect(() => {
    async function loadCountries() {
      try {
        const data = await getVisaCountries();

        setPassports(data.passports || []);
        setDestinations(data.destinations || []);

        setDestinationCode(
          findCountryCode(trip.destination, data.destinations || []),
        );
      } catch (error) {
        setMessage(error.message);
      }
    }

    loadCountries();
  }, [trip.destination]);

  // Ask the backend again whenever either country changes.
  useEffect(() => {
    async function loadVisa() {
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

  // Shortcuts so the JSX below stays readable.
  const rule = visa?.data?.visa_rules?.primary_rule;
  const country = visa?.data?.destination;

  // Some countries also require a form on arrival (China's arrival card, for
  // example). It is only in the response when it applies.
  const registration = visa?.data?.mandatory_registration;

  // "visa-api" = the visa-data service. "gemini" = an AI fallback used when
  // the visa API is out of quota or down. The user must be told which.
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

            {destinations.map((item) => (
              <option key={item.code} value={item.code}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* We could not read a country out of "Paris, France" style text. */}
      {!destinationCode && (
        <p className="visa-note">
          We could not tell which country "{trip.destination}" is in. Pick a
          destination above.
        </p>
      )}

      {loading && <p className="visa-note">Checking visa rules...</p>}

      {message && <p className="visa-error">{message}</p>}

      {rule && !loading && (
        <>
          {/* The API sends a colour: green, yellow or red. */}
          <div className={`visa-banner visa-banner-${rule.color}`}>
            <strong>{rule.name}</strong>
            {rule.duration && <span>Stay up to {rule.duration}</span>}
          </div>

          {/* Always say where the answer came from — the licensed data service
              or the AI fallback. The two read very differently on purpose. */}
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

          {/* Extra paperwork the destination requires on top of the visa. */}
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
