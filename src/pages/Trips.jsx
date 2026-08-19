// An earlier version of this file was kept inline as a large
// commented-out block. Git already stores every previous version, so the
// duplicate has been removed. To read what was there:
//
//   git show 24fccf6:src/pages/Trips.jsx

import { useEffect, useState } from "react";
import { Link } from "react-router";
import { request } from "../api/client";
import { getDestinationImage } from "../lib/destinationImage";
import { formatDateRange, getTripDays, getTripStatus, toUTC } from "../lib/tripDates";
import Icon from "../components/Icon";

// The three states a trip can be in, in the order they matter to someone
// looking at this page. What is happening right now beats what is coming,
// which beats what is over.
const GROUPS = [
  {
    tone: "active",
    title: "Happening now",
    blurb: "You are on this trip today.",
  },
  {
    tone: "upcoming",
    title: "Upcoming",
    blurb: "Planned and still ahead of you.",
  },
  {
    tone: "past",
    title: "Past trips",
    blurb: "Finished — kept for reference.",
  },
  // Trips whose dates never got set. They cannot be sorted with the rest, and
  // dropping them would mean a saved trip silently missing from this page.
  {
    tone: "neutral",
    title: "No dates set",
    blurb: "Add dates to slot these into your timeline.",
  },
];

export default function Trips({ user }) {
  // Get the user's name for the greeting.
  const name = user?.username || user?.name || user?.email || "traveler";

  // Store the saved trips.
  const [trips, setTrips] = useState([]);

  // Track whether trips are loading.
  const [loading, setLoading] = useState(true);

  // Store an error message.
  const [error, setError] = useState("");

  // Load saved trips when the page opens.
  useEffect(() => {
    async function getTrips() {
      try {
        // Get all saved trips from the backend.
        const data = await request("/trips");

        // Save the trips in state.
        setTrips(data);
      } catch (error) {
        setError(error.message);
      }

      setLoading(false);
    }

    getTrips();
  }, []);

  // was: <p>Loading trips...</p> — three words in the corner of an empty page,
  // which reads as "broken" for the second it is on screen. Placeholder tiles
  // in the shape of the real ones say "your trips are on their way".
  if (loading) {
    return (
      <>
        <div className="trips-header">
          <div>
            <h1>Welcome back, {name}</h1>
            <p>Loading your trips…</p>
          </div>
        </div>

        <div className="trip-grid">
          {[0, 1, 2].map((n) => (
            <div className="trip-tile trip-tile-skeleton" key={n} />
          ))}
        </div>
      </>
    );
  }

  // Show an error message.
  if (error) {
    return (
      <div className="trips-error">
        <h2>We couldn&apos;t load your trips</h2>
        <p>{error}</p>
      </div>
    );
  }

  // Work out where each trip sits in time, once, so neither the sort nor the
  // grouping below has to ask again.
  const decorated = trips.map((trip) => {
    const startValue = trip.date_Range?.[0]?.value?.slice(0, 10);
    const endValue = trip.date_Range?.[1]?.value?.slice(0, 10);

    return {
      trip,
      startValue,
      endValue,
      status: getTripStatus(startValue, endValue),
      days: getTripDays(startValue, endValue),
      dateLabel: formatDateRange(startValue, endValue),
      image: getDestinationImage(trip.destination),
    };
  });

  const groups = GROUPS.map((group) => ({
    ...group,
    items: decorated
      .filter((item) => item.status.tone === group.tone)
      // Upcoming: soonest first, because that is the one being packed for.
      // Past: most recent first, because that is the one being looked back at.
      .sort((a, b) => {
        const aStart = toUTC(a.startValue) ?? 0;
        const bStart = toUTC(b.startValue) ?? 0;

        return group.tone === "past" ? bStart - aStart : aStart - bStart;
      }),
  })).filter((group) => group.items.length > 0);

  const activeCount = decorated.filter((i) => i.status.tone === "active").length;
  const upcomingCount = decorated.filter(
    (i) => i.status.tone === "upcoming",
  ).length;

  // A real summary line, built from the trips actually on screen.
  const summary = [
    `${trips.length} ${trips.length === 1 ? "trip" : "trips"} saved`,
    activeCount > 0 && `${activeCount} happening now`,
    upcomingCount > 0 && `${upcomingCount} coming up`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <div className="trips-header">
        <div>
          {/* was: "Welcome back, don! 👋" — the waving hand is the single most
              recognisable stock-dashboard flourish there is. The greeting is
              warmer without it. */}
          <h1>Welcome back, {name}</h1>

          <p>
            {trips.length === 0
              ? "Your saved itineraries will collect here."
              : summary}
          </p>
        </div>

        <Link to="/" className="plan-trip-button">
          + Plan a New Trip
        </Link>
      </div>

      {/* Show an empty state if the user has no saved trips. */}
      {trips.length === 0 ? (
        <div className="trips-empty">
          <div className="trips-empty-icon">🧭</div>

            <h3>No trips saved yet</h3>

          <p>
            Generate an itinerary from the home page and save it — it will show
            up here.
          </p>

          <Link to="/" className="plan-trip-button">
            Plan your first trip
          </Link>
        </div>
      ) : (
        // was: one flat grid under a heading that said "My Upcoming
        // Itineraries" while listing finished trips too. With several trips to
        // the same city, nine near-identical cards gave no way to tell which
        // was which without reading every date.
        groups.map((group) => (
          <section className="trip-group" key={group.tone}>
            <div className="trip-group-head">
              <h2 className="trips-section-title">
                {group.title}
                <span className="trip-group-count">{group.items.length}</span>
              </h2>

              <p className="trip-group-blurb">{group.blurb}</p>
            </div>

            <div className="trip-grid">
              {group.items.map(
                ({ trip, status, days, dateLabel, image }) => (
                  <Link
                    key={trip.id}
                    to={`/trips/${trip.id}`}
                    className="trip-tile"
                  >
                    {/* The photo is what makes six trips to Kyoto tell
                        themselves apart at a glance — that, and the dates
                        being readable rather than raw ISO strings. */}
                    <div
                      className="trip-tile-photo"
                      style={
                        image ? { backgroundImage: `url(${image})` } : undefined
                      }
                    >
                      <span className="trip-tile-scrim" />

                      <span className={`trip-tile-status status-${status.tone}`}>
                        {status.label}
                      </span>

                      <h3 className="trip-tile-name">{trip.destination}</h3>
                    </div>

                    <div className="trip-tile-body">
                      <span className="trip-tile-row">
                        <Icon name="calendar" size={16} />
                        {dateLabel}
                      </span>

                      <span className="trip-tile-row">
                        <Icon name="wallet" size={16} />
                        ${Number(trip.budget || 0).toLocaleString()}
                        <span className="trip-tile-days">
                          {days} {days === 1 ? "day" : "days"}
                        </span>
                      </span>
                    </div>
                  </Link>
                ),
              )}
            </div>
          </section>
        ))
      )}
    </>
  );
}
