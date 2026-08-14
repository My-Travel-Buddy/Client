import { useState } from "react";
const interests = ["Adventure", "Culture", "Food","Relaxation", "Nightlife"];
 const trips =[
        {
            id: "kyoto",
            destination:"Kyoto, Japan",
            interest:"Food , culture",
            budget: 1500,
            season:"Autumn",
            image:"https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8amFwYW4lMjBreW90b3xlbnwwfHwwfHx8MA%3D%3D"
        },
        {
            id:"santorini",
            destination:"Santorini, Greece",
            interest:"sunset-chasing, luxury relaxation",
            budget:2500,
            season:"Summer",
            image:"https://media.istockphoto.com/id/1036361536/photo/panoramia-of-oia-town-in-santorini.jpg?s=612x612&w=0&k=20&c=zC34PF-WEOUPz2LWlHClV6TgYyjaOWm_U7EYSuQ4PYU="
        },
        {
            id:"bali",
            destination:"Bali, Indonesia",
            interest:"nature, spirituality",
            budget :1000,
            season:"Spring",
            image:"https://media.istockphoto.com/id/2273946349/photo/pura-ulun-danu-bratan-hindu-temple-with-boat-on-bratan-lake-landscape-at-sunrise-in-bali.jpg?s=612x612&w=0&k=20&c=dPzjSygNBhVIBQzBrNHxw80WxeuaGhQpSLgQky444JI="
        },
        {
            id:"lisbon",
            destination:"Lisbon, Portugal",
            interest:"food, history",
            budget:1400,
            season:"Spring",
            image:"https://media.istockphoto.com/id/516550104/photo/lisbon-tram-and-cityscape.jpg?s=612x612&w=0&k=20&c=NrZ14iMTzaKBuNawkv95nZGoYJcsg-JikID5s7orSkg="
        },
        {
            id:"banff",
            destination: "Banff, Canada",
            interest: "kayaking, hiking, nature photography",
            budget:600,
            season: "Summer",
            image:"https://images.unsplash.com/photo-1662434449168-35f32702b665?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGJhbmZmfGVufDB8fDB8fHww"

        },
    ]

function InterestTag({label, active, onClick }){
    return(
        <button
        type="button"
        className={`interest-tag ${active ? "active" : ""}`}
        onClick = {onClick}
        >
            {label}

        </button>  
    );
}

function TripCard({ trip, selected, onClick }) {
    return(
        <div
        className={`trip-card ${selected ? "selected":""}`}
        onClick={onClick}
        >
            <div
            className="trip-card-image"
            style={{backgroundImage: `URL(${trip.image})`}}
            />
            <div className="trip-card-body">
                <div className ="trip-card-top">
                    <h3>{trip.destination.split(",")[0]}</h3>
                    <span className="trip-card-season">{trip.season}</span>
                 </div>
                 <p className= "trip-card-price">Est:${trip.budget}</p>

            </div>
            
        </div>
    );
}
export default function RenderingTrips({setFormData}){
    const [activeInterests, setActiveinterests] = useState([]);
    const [selectedTrip, setSelectedTrip] = useState(null);
    
    function toggleInterest(interest){
        setActiveinterests((prev) =>
        prev.includes(interest) ? prev.filter((i) => i !== interest): [...prev, interest]
        
    );
    console.log(activeInterests)
    }

    function handleOnClick(idx){
        setFormData({
            destination: trips[idx].destination,
            startDate: "",
            endDate: "",
            budget: trips[idx].budget,
            interests: [],
        })
    }

    return(
        


        <div className="trips-page">
            <br />
           <h1> Popular destinations</h1>
           <div className="trips-grid">
            {trips.map((trip,idx) => (
                <TripCard
                key={idx}
                trip={trip}
                selected={selectedTrip === idx}
                onClick={() => handleOnClick(idx)}
                />
            ))}
           </div>
        </div>
    );
}
        
        
        

       

    