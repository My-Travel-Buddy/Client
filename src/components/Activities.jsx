function Activities({ trip }) {
  console.log(trip.Activities);

  return (
    <>
      <div>Activities</div>
      {trip.Activities.map((activity, index) => (
        <div key={index}>
          <ul>
            <li>
              {index + 1}. {activity.title}{" "}
            </li>
            <li> Category: {activity.category} </li>
            <li>
              {" "}
              When:{" "}
              {new Date(activity.dateTime).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })}
            </li>
            <li>
                Cost: ${activity.estimatedCost}
            </li>
          </ul>
          <br />
        </div>
      ))}
    </>
  );
}

export default Activities;
