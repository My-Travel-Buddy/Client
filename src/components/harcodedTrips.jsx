function HardcodedTrips({trip}){
    return(
        <div>
            <h3>{trip.destination}</h3>
            <p>{trip.startDate}</p>
            <p>{trip.endDate}</p>
            <p>{trip.interest}</p>
        </div>
    
    )
}
export default function RenderingTrips(){

    const trips =[
        {
            destination:"Kyoto, Japan",
            interest:"Food , culture"
        },
        {
            destination:"Santorini, Greece",
            interest:"sunset-chasing, luxury relaxation"
        },
        {
            destination:"Bali, Indonesia",
            interest:"nature, spirituality"
        },
        {
            destination:"Lisbon, Portugal",
            interest:"food, history"
        },
        {
            destination: "Banff, Canada",
            interest: "kayaking, hiking, nature photography"

        },
    ]
    return(


        <div>
            <h1>Trips you might like!</h1>
           {trips.map((trip,idx) => 
            <HardcodedTrips key={idx} trip={trip} />
           ) }
        </div>
    )
}