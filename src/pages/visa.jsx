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