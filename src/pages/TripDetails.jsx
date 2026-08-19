// An earlier version of this file was kept inline as a large
// commented-out block. Git already stores every previous version, so the
// duplicate has been removed. To read what was there:
//
//   git show 24fccf6:src/pages/TripDetails.jsx

import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router";
import axios from "axios";
import Activities from "../components/Activities";
import Checklist from "../components/Checklist";
import Documents from "../components/Documents";
import TripCalendar from "../components/Calendar";
import { getDestinationImage } from "../lib/destinationImage";
import { getCategoryStyle } from "../lib/categories";
import {
  formatDateRange,
  formatDay,
  getTripDays,
  getTripStatus,
} from "../lib/tripDates";
import Icon from "../components/Icon";

// The tabs on this page, in order. Each one is both the button label and the
// value stored in `activeSection`.
const SECTIONS = [
  "Overview",
  "Itinerary",
  "Documents",
  "Checklist",
  "Activities",
];

// The API base URL never changes while the app is running, so it lives
// outside the component.
const BACKEND_API = import.meta.env.VITE_API_URL;

export default function TripDetails() {
  const { id } = useParams();

  const [trip, setTrip] = useState(null);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("Overview");

  // "Now", captured once when the page mounts.
  //
  // Reading Date.now() during render makes the render impure: "Next up" could
  // pick a different set of activities on a re-render that changed nothing
  // else, and the list would reshuffle under the user's cursor. A lazy useState
  // initialiser runs exactly once, so the answer holds for the visit.
  const [now] = useState(() => Date.now());

  // Fetch whenever the id in the URL changes.
  useEffect(() => {
    const getTrip = async () => {
      try {
        const response = await axios.get(`${BACKEND_API}/trips/${id}`, {
          withCredentials: true,
        });
        const data = await response.data;
        setTrip(data);
      } catch (err) {
        setError(
          err.response?.data?.message || err.message || "Failed to load trips",
        );
      }
    };
    getTrip();
  }, [id]);

  // The hero photo is chosen from the destination name, so it must not be
  // recomputed on every render — useMemo keeps it stable while the user clicks
  // between tabs. See lib/destinationImage.js for why stability matters.
  const heroImage = useMemo(
    () => getDestinationImage(trip?.destination),
    [trip?.destination],
  );

  if (error) return <p className="text-red-500">{error}</p>;

  // was: <p>Loading…</p> — one unstyled word in the top-left corner, which is
  // indistinguishable from a broken page. A skeleton in the shape of the real
  // layout tells you the page is coming.
  if (!trip) {
    return (
      <section className="trip-page">
        <div className="trip-hero trip-hero-skeleton" />
        <div className="trip-skeleton-tabs" />
        <div className="trip-skeleton-panel" />
      </section>
    );
  }

  // ---- Overview figures, derived from the trip we already have ----
  // All of these come from data already on screen, so the Overview tab costs
  // no extra request.
  const activities = trip.Activities || [];
  const checklists = trip.Checklists || [];

  const activityCount = activities.length;

  const estimatedSpend = activities.reduce(
    (sum, activity) => sum + Number(activity.estimatedCost || 0),
    0,
  );

  const checklistTotal = checklists.length;
  const checklistDone = checklists.filter((item) => item.completed).length;
  const checklistPercent = checklistTotal
    ? Math.round((checklistDone / checklistTotal) * 100)
    : 0;

  const startValue = trip.date_Range?.[0]?.value?.slice(0, 10);
  const endValue = trip.date_Range?.[1]?.value?.slice(0, 10);

  // Inclusive: a trip that starts and ends on the same date is 1 day.
  const tripDays = getTripDays(startValue, endValue);

  const budgetNumber = Number(trip.budget) || 0;
  const overBudget = budgetNumber > 0 && estimatedSpend > budgetNumber;
  const budgetPercent =
    budgetNumber > 0 ? Math.round((estimatedSpend / budgetNumber) * 100) : 0;

  // ---- Where the trip is in time ----
  const status = getTripStatus(startValue, endValue);

  // A real date line instead of the raw "2026-08-19 -to- 2026-08-27".
  const dateLabel = formatDateRange(startValue, endValue);

  // ---- Spend by category ----
  // The budget bar answers "how much"; this answers "on what", which is the
  // question the bar always prompts and could never answer.
  const categoryTotals = new Map();

  for (const activity of activities) {
    const name = activity.category || "Other";
    const previous = categoryTotals.get(name) || { total: 0, count: 0 };

    categoryTotals.set(name, {
      total: previous.total + Number(activity.estimatedCost || 0),
      count: previous.count + 1,
    });
  }

  const categories = [...categoryTotals.entries()]
    .map(([name, value]) => ({ name, ...value }))
    .sort((a, b) => b.total - a.total);

  const biggestCategory = categories[0]?.total || 0;

  // ---- What is next ----
  // Activities still ahead of us, soonest first. On a finished trip there is
  // nothing ahead, so fall back to the first few of the trip — an empty panel
  // would be worse than a look back at what was planned.
  const dated = activities
    .filter((activity) => activity.dateTime)
    .sort((a, b) => String(a.dateTime).localeCompare(String(b.dateTime)));

  const ahead = dated.filter(
    (activity) => new Date(activity.dateTime).getTime() >= now,
  );

  const isLookingBack = ahead.length === 0;
  const nextUp = (isLookingBack ? dated : ahead).slice(0, 3);

  const openChecklist = checklists
    .filter((item) => !item.completed)
    .slice(0, 4);

  return (
    <section className="trip-page">
      {/* ---------------------------------------------------------------
          Hero. The destination photo does the work a plain <h1> on white
          could not: it says WHERE you are before you read a word.
          The scrim is not decoration — white text on an unknown photo is
          unreadable without it.
          --------------------------------------------------------------- */}
      <header
        className="trip-hero"
        style={heroImage ? { backgroundImage: `url(${heroImage})` } : undefined}
      >
        <div className="trip-hero-scrim" />

        <div className="trip-hero-content">
          <Link to="/trips" className="trip-hero-back">
            ← All trips
          </Link>

          <span className={`trip-status trip-status-${status.tone}`}>
            {status.label}
          </span>

          <h1 className="trip-hero-title">{trip.destination}</h1>

          <dl className="trip-hero-facts">
            <div className="trip-hero-fact">
              <dt>Dates</dt>
              <dd>{dateLabel}</dd>
            </div>

            <div className="trip-hero-fact">
              <dt>Length</dt>
              <dd>
                {tripDays} {tripDays === 1 ? "day" : "days"}
              </dd>
            </div>

            <div className="trip-hero-fact">
              <dt>Budget</dt>
              <dd>${budgetNumber.toLocaleString()}</dd>
            </div>

            <div className="trip-hero-fact">
              <dt>Planned</dt>
              <dd>
                {activityCount}{" "}
                {activityCount === 1 ? "activity" : "activities"}
              </dd>
            </div>
          </dl>
        </div>
      </header>

      <div className="trip-tabs" role="tablist" aria-label="Trip sections">
        {SECTIONS.map((section) => (
          <button
            key={section}
            type="button"
            role="tab"
            aria-selected={activeSection === section}
            className={`trip-tab ${activeSection === section ? "active" : ""}`}
            onClick={() => setActiveSection(section)}
          >
            {section}
          </button>
        ))}
      </div>

      {/* was: {activeSection === 'Overview'}
          That line evaluated to a boolean and React renders booleans as
          nothing, so the Overview tab was silently blank. */}
      {activeSection === "Overview" && (
        <div className="overview">
          {/* Stats and the budget run the FULL width, above the two columns.
              The budget is the number that decides whether the plan works, so
              it gets its own row rather than sharing space with a list. */}
          <div className="overview-grid">
            <div className="overview-stat">
              <span className="overview-stat-icon">
                <Icon name="calendar" size={22} />
              </span>
              <span className="overview-stat-label">Trip length</span>
              <span className="overview-stat-value">
                {tripDays} {tripDays === 1 ? "day" : "days"}
              </span>
            </div>

            <div className="overview-stat">
              <span className="overview-stat-icon">
                <Icon name="pin" size={22} />
              </span>
              <span className="overview-stat-label">Activities</span>
              <span className="overview-stat-value">{activityCount}</span>
            </div>

            <div className="overview-stat">
              <span className="overview-stat-icon">
                <Icon name="wallet" size={22} />
              </span>
              <span className="overview-stat-label">Estimated spend</span>
              <span className="overview-stat-value">
                ${estimatedSpend.toLocaleString()}
              </span>
            </div>

            <div className="overview-stat">
              <span className="overview-stat-icon">
                <Icon name="check" size={22} />
              </span>
              <span className="overview-stat-label">Checklist</span>
              <span className="overview-stat-value">
                {checklistDone} of {checklistTotal}
              </span>
            </div>
          </div>

          {/* Full width, and marked when it is over — this is the line that
              says whether the plan is affordable. */}
          <div
            className={`overview-card overview-budget${overBudget ? " is-over" : ""}`}
          >
            <div className="overview-budget-head">
              <span>
                ${estimatedSpend.toLocaleString()} planned of $
                {budgetNumber.toLocaleString()} budget
              </span>
              <span
                className={
                  overBudget ? "overview-badge over" : "overview-badge under"
                }
              >
                {overBudget
                  ? `$${(estimatedSpend - budgetNumber).toLocaleString()} over`
                  : `$${(budgetNumber - estimatedSpend).toLocaleString()} left`}
              </span>
            </div>

            <div className="overview-bar">
              <div
                className={
                  overBudget ? "overview-bar-fill over" : "overview-bar-fill"
                }
                // Capped at 100% so going over budget cannot overflow the bar.
                style={{ width: `${Math.min(budgetPercent, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="overview-columns">
            <div className="overview-main">
              <div className="overview-card">
                <h3 className="overview-card-title">Where the money goes</h3>

                {categories.length === 0 ? (
                  <p className="overview-empty">
                    No activities yet — add a few and the breakdown appears
                    here.
                  </p>
                ) : (
                  <ul className="spend-list">
                    {categories.map((category) => {
                      const style = getCategoryStyle(category.name);

                      return (
                        <li className="spend-row" key={category.name}>
                          <span className="spend-name">
                            <span className={`spend-icon tint-${style.tint}`}>
                              <Icon name={style.icon} size={15} />
                            </span>
                            {category.name}
                          </span>

                          <span className="spend-track">
                            {/* Bars are scaled against the BIGGEST category,
                                not the budget — against the budget every bar
                                would be a sliver and the comparison lost. */}
                            <span
                              className={`spend-fill tint-${style.tint}`}
                              style={{
                                width: `${biggestCategory ? Math.max((category.total / biggestCategory) * 100, 4) : 4}%`,
                              }}
                            />
                          </span>

                          <span className="spend-value">
                            ${category.total.toLocaleString()}
                            <small>
                              {category.count}{" "}
                              {category.count === 1 ? "item" : "items"}
                            </small>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>

            <aside className="overview-side">
              <div className="overview-card">
                {/* The trip's position in time was a whole card for one short
                    line. It is a strip on top of "Next up" now — same
                    information, a fraction of the space, and next to the
                    activities it actually qualifies. */}
                <div className={`status-strip status-${status.tone}`}>
                  <span className="status-dot" />
                  {status.summary}
                </div>

                <h3 className="overview-card-title">
                  {isLookingBack ? "How it started" : "Next up"}
                </h3>

                {nextUp.length === 0 ? (
                  <p className="overview-empty">
                    Nothing scheduled yet. Add activities from the Activities
                    tab.
                  </p>
                ) : (
                  <ul className="next-list">
                    {nextUp.map((activity) => {
                      const style = getCategoryStyle(activity.category);

                      return (
                        <li className="next-item" key={activity.id}>
                          <span className={`next-icon tint-${style.tint}`}>
                            <Icon name={style.icon} size={18} />
                          </span>

                          <span className="next-body">
                            <strong>{activity.title}</strong>
                            <small>
                              {formatDay(activity.dateTime, {
                                day: "numeric",
                                month: "short",
                              })}
                              {" · "}
                              {new Date(activity.dateTime).toLocaleTimeString(
                                [],
                                { hour: "numeric", minute: "2-digit" },
                              )}
                            </small>
                          </span>

                          <span className="next-cost">
                            ${Number(activity.estimatedCost || 0)}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}

                <button
                  type="button"
                  className="overview-link"
                  onClick={() => setActiveSection("Activities")}
                >
                  View all activities →
                </button>
              </div>

              <div className="overview-card">
                <h3 className="overview-card-title">Checklist</h3>

                <div className="overview-bar">
                  <div
                    className="overview-bar-fill"
                    style={{ width: `${checklistPercent}%` }}
                  ></div>
                </div>

                <p className="checklist-progress">
                  {checklistDone} of {checklistTotal} done
                </p>

                {openChecklist.length > 0 && (
                  <ul className="open-list">
                    {openChecklist.map((item) => (
                      <li key={item.id}>{item.text}</li>
                    ))}
                  </ul>
                )}

                <button
                  type="button"
                  className="overview-link"
                  onClick={() => setActiveSection("Checklist")}
                >
                  Open checklist →
                </button>
              </div>
            </aside>
          </div>
        </div>
      )}

      {/* The calendar brings no card of its own, so it gets one here — that
          way Itinerary, Documents and Checklist all sit on the same panel. */}
      {activeSection === "Itinerary" && (
        <div className="tab-panel">
          <TripCalendar tripId={trip.id} />
        </div>
      )}
      {activeSection === "Documents" && <Documents trip={trip} />}
      {activeSection === "Checklist" && (
        <Checklist trip={trip} setTrip={setTrip} />
      )}
      {activeSection === "Activities" && (
        <Activities trip={trip} setTrip={setTrip} />
      )}
    </section>
  );
}
