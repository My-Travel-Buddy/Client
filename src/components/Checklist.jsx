function Checklist({ trip }) {
  console.log(trip.Checklists);

async function check(params) {
  
  
}


  return (
    <>

      <form>
      <fieldset>
        <legend>Checklist</legend>
        {trip.Checklists.map((list, index) => (
          <label key={list.text} value={list.text}>
            <ul>
              <li>
                <input type="checkbox" id="checklist"  />{" "}
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
