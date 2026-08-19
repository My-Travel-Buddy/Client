// components/Icon.jsx
//
// A small set of line icons, drawn as inline SVG.
//
// Why not emoji, which is what this page used before? Emoji are pictures from
// the operating system's font: they arrive in someone else's colours, they
// render differently on Windows, macOS and Android, and at 14px they turn into
// coloured mush. The giveaway that a page was assembled rather than designed is
// usually a row of emoji standing in for icons.
//
// These take their colour from the text around them (`stroke="currentColor"`),
// so one icon works on a white card, on a teal chip and on the photo hero
// without a second copy in a different colour.

const PATHS = {
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M8 3v4M16 3v4M3 11h18" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  wallet: (
    <>
      <rect x="3" y="6" width="18" height="13" rx="2.5" />
      <path d="M3 10h18" />
      <circle cx="16.5" cy="14.5" r="1.1" />
    </>
  ),
  check: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.4 12.3 2.4 2.4 4.8-5.2" />
    </>
  ),
  landmark: (
    <>
      <path d="M12 3 3.5 8h17L12 3Z" />
      <path d="M5.5 11v7M10 11v7M14 11v7M18.5 11v7M3 21h18" />
    </>
  ),
  camera: (
    <>
      <path d="M4 8h2.8l1.4-2.2h7.6L17.2 8H20a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="13.2" r="3.4" />
    </>
  ),
  utensils: (
    <>
      <path d="M7 3v6.5a2 2 0 0 0 4 0V3" />
      <path d="M9 9.5V21" />
      <path d="M17.6 3c-1.4 1.3-2.1 2.9-2.1 4.6 0 1.6.7 2.7 2.1 3.2V21" />
    </>
  ),
  bag: (
    <>
      <path d="M6.2 7h11.6l.9 13H5.3l.9-13Z" />
      <path d="M9 10V6.5a3 3 0 0 1 6 0V10" />
    </>
  ),
  ticket: (
    <>
      <path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1.8a2.2 2.2 0 0 0 0 4.4V16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1.8a2.2 2.2 0 0 0 0-4.4V8Z" />
      <path d="M14 7.5v9" strokeDasharray="2 2.5" />
    </>
  ),
  leaf: (
    <>
      <path d="M4.5 19.5c-1-8 5-15 15.5-15.5.8 10.5-5.5 16-13 15.5" />
      <path d="M4.5 19.5 14 10" />
    </>
  ),
  plane: (
    <>
      <path d="M10.6 3.6a1.4 1.4 0 0 1 2.8 0v5.2l7.1 4v2.1l-7.1-2.1v4l2.4 1.9v1.6L12 19.1l-3.8 1.2v-1.6l2.4-1.9v-4L3.5 15v-2.1l7.1-4V3.6Z" />
    </>
  ),
  moon: (
    <>
      <path d="M20.2 14.7A8.6 8.6 0 0 1 9.3 3.8a8.6 8.6 0 1 0 10.9 10.9Z" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.6 8.4-2.1 5.1-5.1 2.1 2.1-5.1 5.1-2.1Z" />
    </>
  ),
};

export default function Icon({ name, size = 20, className = "" }) {
  const path = PATHS[name] || PATHS.compass;

  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      // Decorative: every icon here sits next to a text label that already
      // says the same thing, so a screen reader repeating it would be noise.
      aria-hidden="true"
      focusable="false"
    >
      {path}
    </svg>
  );
}
