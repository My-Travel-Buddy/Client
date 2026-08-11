function Checklist({ trip }) {
  console.log(trip.Checklists);

  return (
    <>
      <div>Checklist</div>
      {trip.Checklists.map((list, index) => (
        <div key={index}>
          <ol>
            <li>
                {list.text}
            </li>
          </ol>
        </div>
      ))}
    </>
  );
}

export default Checklist;
