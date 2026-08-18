function Checklist({ trip, setTrip }) {
  // Update a checklist item when the user checks or unchecks it.
  async function checkEdit(e, item) {
    const response = await fetch(
      `http://localhost:8080/trips/${trip.id}/${item.id}/checklist/edit`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },

        // Send the opposite of the current completed value.
        body: JSON.stringify({ completed: !item.completed }),
      },
    );

    // Stop if the update fails.
    if (!response.ok) {
      alert("Failed to save checklist.");
      return;
    }

    // Get the updated checklist item from the backend.
    const updatedchecked = await response.json();

    // Make a copy of the current trip.
    const newTrip = { ...trip };

    // Replace the old checklist item with the updated one.
    newTrip.Checklists = newTrip.Checklists.map((item) => {
      if (item.id === updatedchecked.id) {
        return updatedchecked;
      } else {
        return item;
      }
    });

    // Update the trip on the page.
    setTrip(newTrip);
  }

  // Send the selected checklist item to be updated.
  const markCheck = (item, index, e) => {
    checkEdit(e, trip.Checklists[index]);
  };

  return (
    <>
      <form>
        <fieldset>
          <legend>Checklist</legend>

          {/* Show each checklist item with a checkbox. */}
          {trip.Checklists.map((list, index) => (
            <label key={list.id}>
              <ul>
                <li>
                  <input
                    checked={list.completed}
                    onChange={(e) => markCheck(list, index, e)}
                    type="checkbox"
                    id={`checklist-${list.id}`}
                  />{" "}
                  {list.text}
                </li>
              </ul>
            </label>
          ))}
        </fieldset>
      </form>
    </>
  );
}

export default Checklist;
