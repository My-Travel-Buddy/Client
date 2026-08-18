/* ============================================================
   src/pages/visa.jsx — deleted in commit 373b5d4.
   Documents.jsx replaced this file.
   This old file is kept here only for reference.
   ============================================================ */

import { useEffect, useState } from "react";
import { getVisaRequirements } from "../api/client";

// List of country codes used by the Visa API.
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

// Match API colors to CSS styles.

// Match API colors to CSS styles.
// Change the API color into the correct CSS class.
const BANNER_VARIANT = {
  green: "",
  yellow: "vy-banner--warn",
  red: "vy-banner--danger",
};

export default function visa() {
  const [passportCode, setPassportCode] = useState("US");
  const [destinationCode, setPassportCode] = useState("US");

  const [result, setResult] = useState(null);
  const [result, setResult] = useState("idle"); // Track the request status.
  const [message, setMessage] = useState("");

  // Get visa information when the passport or destination changes.
  // Ignore an old response if the user changes the selection.
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
