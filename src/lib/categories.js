// lib/categories.js
//
// One place that decides what an activity category LOOKS like.
//
// Both the activity cards and the Overview spend breakdown need an icon and a
// colour per category. Without a shared table the two would drift — Food would
// be amber in one place and grey in the other — which is exactly the kind of
// small inconsistency that makes a page look unfinished.
//
// `icon` is a name from components/Icon.jsx, not an emoji. See that file for
// why.

const CATEGORIES = {
  sightseeing: { icon: "camera", tint: "sky" },
  culture: { icon: "landmark", tint: "violet" },
  food: { icon: "utensils", tint: "amber" },
  shopping: { icon: "bag", tint: "pink" },
  entertainment: { icon: "ticket", tint: "teal" },
  adventure: { icon: "compass", tint: "green" },
  nature: { icon: "leaf", tint: "green" },
  outdoors: { icon: "leaf", tint: "green" },
  transport: { icon: "plane", tint: "slate" },
  travel: { icon: "plane", tint: "slate" },
  nightlife: { icon: "moon", tint: "violet" },
  other: { icon: "pin", tint: "slate" },
};

const FALLBACK = { icon: "compass", tint: "slate" };

export function getCategoryStyle(category) {
  const key = String(category || "")
    .trim()
    .toLowerCase();

  // Match on "contains" so "Food & Culinary" finds the "food" entry.
  const found = Object.keys(CATEGORIES).find((name) => key.includes(name));

  return found ? CATEGORIES[found] : FALLBACK;
}
