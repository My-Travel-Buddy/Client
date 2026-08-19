// lib/tripDates.js
//
// Every date question the app asks about a trip, answered in one place:
// how long is it, has it started, what should the date line say.
//
// It lives here because the trip page and the trips list both ask, and two
// copies of this logic drift — one says "9 days" while the other says "8",
// and neither is obviously the wrong one.
//
// THE TIMEZONE RULE, once, so it isn't re-learned per file:
// `new Date("2026-08-19")` is parsed as UTC midnight and then displayed in
// LOCAL time, so anywhere west of Greenwich it renders as the 18th. Every
// function below builds and reads its dates in UTC instead.

export const MS_PER_DAY = 24 * 60 * 60 * 1000;

// "2026-08-19" (or a full ISO stamp) -> a UTC timestamp, or null if unusable.
export function toUTC(value) {
  const key = String(value || "").slice(0, 10);
  const [y, m, d] = key.split("-").map(Number);

  if (!y || !m || !d) {
    return null;
  }

  return Date.UTC(y, m - 1, d);
}

// "2026-08-19" -> "Wed 19 Aug", per the options given.
export function formatDay(value, options) {
  const stamp = toUTC(value);

  if (stamp === null) {
    return "";
  }

  return new Date(stamp).toLocaleDateString(undefined, {
    timeZone: "UTC",
    ...options,
  });
}

// Today at UTC midnight, so it compares against trip dates without a stray
// hour tipping the answer over a day boundary.
export function todayUTC() {
  const now = new Date();

  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}

// Inclusive: a trip that starts and ends on the same date is 1 day, not 0.
export function getTripDays(startValue, endValue) {
  const start = toUTC(startValue);
  const end = toUTC(endValue);

  if (start === null || end === null) {
    return 0;
  }

  return Math.round((end - start) / MS_PER_DAY) + 1;
}

// "Aug 19 – 27, 2026" when both ends share a month, "Aug 29 – Sep 3, 2026"
// when they don't. The year is appended once at the end rather than being
// asked of toLocaleDateString, which would place it mid-string as
// "19 – Aug 27, 2026".
export function formatDateRange(startValue, endValue) {
  if (!startValue || !endValue) {
    return "Dates not set";
  }

  const sameMonth = String(startValue).slice(0, 7) === String(endValue).slice(0, 7);

  const from = formatDay(startValue, { month: "short", day: "numeric" });
  const to = formatDay(
    endValue,
    sameMonth ? { day: "numeric" } : { month: "short", day: "numeric" },
  );

  return `${from} – ${to}, ${String(endValue).slice(0, 4)}`;
}

// Where the trip sits relative to today.
//
// `tone` is the styling hook ("upcoming" / "active" / "past" / "neutral"),
// `label` is the short badge text, `detail` the longer line beneath it.
export function getTripStatus(startValue, endValue) {
  const start = toUTC(startValue);
  const end = toUTC(endValue);

  if (start === null || end === null) {
    return {
      tone: "neutral",
      label: "Dates not set",
      summary: "Dates not set",
      detail: "",
      daysAway: null,
    };
  }

  const today = todayUTC();
  const tripDays = getTripDays(startValue, endValue);

  if (today < start) {
    const away = Math.round((start - today) / MS_PER_DAY);

    return {
      tone: "upcoming",
      label: away === 1 ? "Departs tomorrow" : `${away} days to go`,
      summary:
        away === 1 ? "Trip starts tomorrow" : `Trip starts in ${away} days`,
      detail: `Departure ${formatDay(startValue, {
        weekday: "long",
        day: "numeric",
        month: "long",
      })}`,
      daysAway: away,
    };
  }

  if (today > end) {
    return {
      tone: "past",
      label: "Trip complete",
      summary: "Trip completed",
      detail: `Ended ${formatDay(endValue, {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}`,
      daysAway: null,
    };
  }

  const dayNumber = Math.round((today - start) / MS_PER_DAY) + 1;

  return {
    tone: "active",
    label: "Happening now",
    summary: `Day ${dayNumber} of ${tripDays}`,
    detail: `Day ${dayNumber} of ${tripDays}`,
    daysAway: 0,
  };
}
