// lib/destinationImage.js
//
// Picks the photo that represents a destination.
//
// Two rules, in order:
//
//   1. If the destination name contains a keyword we recognise ("Kyoto",
//      "Santorini", "Amalfi"), use the matching photo. Kyoto gets Mount Fuji,
//      not a random beach.
//   2. Otherwise pick one from the same pool by hashing the name. A hash, not
//      Math.random(), because the SAME trip must get the SAME photo every time
//      the page renders — a hero image that reshuffles on every re-render is
//      the single most "unfinished" thing a page can do.
//
// The pool is the auth-background set already in the repo, loaded the same way
// HomePage loads it, so no new image files are needed.

const PHOTOS = Object.entries(
  import.meta.glob("../assets/travel-auth-backgrounds/desktop-webp/*.webp", {
    eager: true,
    query: "?url",
    import: "default",
  }),
)
  .sort(([pathA], [pathB]) => pathA.localeCompare(pathB))
  .map(([path, url]) => ({ path, url }));

// Look a photo up by the number it starts with, so the map below reads as
// "Japan means photo 02" rather than repeating a long file path each time.
function photo(number) {
  const match = PHOTOS.find(({ path }) => path.includes(`/${number}-`));
  return match?.url;
}

// destination keyword -> photo number. Lower-cased on both sides before
// comparing, so "KYOTO, Japan" and "kyoto" both land here.
const KEYWORDS = [
  [["japan", "tokyo", "kyoto", "osaka", "fuji", "nara"], "02"],
  [["greece", "santorini", "athens", "mykonos", "crete"], "03"],
  [["italy", "amalfi", "rome", "naples", "positano", "sicily"], "01"],
  [["venice", "venezia", "verona", "croatia"], "10"],
  [["france", "paris", "nice", "lyon", "provence"], "05"],
  [["maldives", "bali", "thailand", "phuket", "fiji", "tahiti", "caribbean"], "04"],
  [["swiss", "switzerland", "alps", "alpine", "zermatt", "austria"], "06"],
  [["morocco", "marrakech", "sahara", "egypt", "cairo", "dubai", "desert", "jordan"], "07"],
  [["new york", "nyc", "manhattan", "chicago", "boston", "toronto"], "08"],
  [["iceland", "reykjavik", "norway", "finland", "sweden", "faroe"], "09"],
];

export function getDestinationImage(destination) {
  const name = String(destination || "").toLowerCase();

  for (const [words, number] of KEYWORDS) {
    if (words.some((word) => name.includes(word))) {
      const match = photo(number);
      if (match) return match;
    }
  }

  // No keyword matched. Hash the name into the pool so the choice is arbitrary
  // but STABLE — same destination, same photo, every render.
  let hash = 0;

  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) % 100000;
  }

  return PHOTOS[hash % PHOTOS.length]?.url;
}
