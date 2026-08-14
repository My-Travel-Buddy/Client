import { useEffect, useState } from "react";
import { getVisaRequirements } from "../api/client";

// Common countries using the ISO alpha-2 codes required by the Visa API.
const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "MX", name: "Mexico" },
  { code: "BR", name: "Brazil" },
  { code: "DO", name: "Dominican Republic" },
  { code: "HT", name: "Haiti" },
  { code: "GB", name: "United Kingdom" },
  { code: "FR", name: "France" },
  { code: "ES", name: "Spain" },
  { code: "PT", name: "Portugal" },
  { code: "IT", name: "Italy" },
  { code: "DE", name: "Germany" },
  { code: "GR", name: "Greece" },
  { code: "MA", name: "Morocco" },
  { code: "ZA", name: "South Africa" },
  { code: "NG", name: "Nigeria" },
  { code: "EG", name: "Egypt" },
  { code: "JP", name: "Japan" },
  { code: "CN", name: "China" },
  { code: "KR", name: "South Korea" },
  { code: "TH", name: "Thailand" },
  { code: "ID", name: "Indonesia" },
  { code: "IN", name: "India" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "AU", name: "Australia" },
];

// The API's colour vocabulary -> the banner variants in voyager-ui.css.

// The API's colour vocabulary -> the banner variants in voyager-ui.css.
// This converts the API’s color into a CSS class:
const BANNER_VARIANT = {
  green: "",
  yellow: "vy-banner--warn",
  red: "vy-banner--danger",
};

export default function visa() {
  const [passportCode, setPassportCode] = useState("US");
  const [destinationCode, setPassportCode] = useState("US");

  const [result, setResult] = useState(null);
  const [result, setResult] = useState("idle"); // idle | loading | done | error
  const [message, setMessage] = useState("");

  // Fetch new visa information when the passport or destination changes.
  // Ignore outdated responses if the user changes a selection quickly.
  useEffect(() => {
    let ignore = false;

    async function load() {
      setStatus("loading");
      setMessage("");

      try {
        const data = await getVisaRequirements(passportCode, destinationCode);
        if (ignore) return;

        setResult(data);
        setStatus("done");
      } catch (error) {
        if (ignore) return;

        setMessage(error.message);
        setStatus("error");
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [passportCode, destinationCode]);

  const info = result?.data;
  const rule = info?.visa_rules?.primary_rule;
  const destination = info?.destination;
  const registration = info?.mandatory_registration;
}
