
function Checklist({ trip, setTrip }) {

  async function checkEdit(e, item) {
    const response = await fetch(
      `http://localhost:8080/trips/${trip.id}/${item.id}/checklist/edit`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed: !item.completed })
      },
    );

    if (!response.ok){
      alert("Failed to save checklist.")
      return
    }

    const updatedchecked = await response.json()
    // console.log(updatedchecked)
    const newTrip = {...trip}

    newTrip.Checklists = newTrip.Checklists.map((item) => {
      if(item.id === updatedchecked.id){
        return updatedchecked
      } else return item
    })

    // console.log(newTrip)
    setTrip(newTrip)

  }

  const markCheck = (item, index, e) => {
    checkEdit(e, trip.Checklists[index])
  };

  return (
    <>
      <form>
        <fieldset>
          <legend>Checklist</legend>
          {trip.Checklists.map((list, index) => (
            <label key={list.id}>
              <ul>
                <li>
                  <input
                    checked={list.completed}
                    onChange={(e) => markCheck(list, index, e)}
                    type="checkbox"
                    id={`checklist-${list.id}`}
                  /> {list.text}
                </li>
              </ul>
            </label>
          ))}
        </fieldset>
        {/* <button
        onClick={checkEdit}>Save</button> */}
      </form>
    </>
  );
}

export default Checklist;