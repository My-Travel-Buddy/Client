import { formatDateRange, countDays, formatMoney } from "../utils/format";

// Flight, accommodation, and companion data are not available in the database yet.
export default function TripOverview({ trip }) {
  const activities = trip.Activities ?? [];
  const checklist = trip.Checklists ?? [];

  const startDate = trip.date_Range[0].value;
  const endDate = trip.date_Range[1].value;
  const days = countDays(startDate, endDate);

  // Calculate the total estimated cost of all activities.
  const planned = activities.reduce(
    (total, activity) => total + (Number(activity.estimatedCost) || 0),
    0,
  );

  return <section>{/* Add the Trip Overview UI here */}</section>;
}
