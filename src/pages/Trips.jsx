import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import axios from 'axios';
import TripCalendar from "../components/Calendar";

export default function Trips() {

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 

  const BACKEND_API = import.meta.env.VITE_API_URL; 

  console.log();
  useEffect(() => {
    const getBackendData = async () => {
      try{
        const response = await axios.get(`${BACKEND_API}/trips`)
        const data = response.data

        setTrips(data)
      }
      catch(err){
        setError(err.response?.data?.message || err.message || 'Failed to load trips');
      }
      finally{
        setLoading(false)
      }
    }
    getBackendData()
  },[])

  if (loading){
    return <div>Loading...</div>
  }

  if (error){
    return <div>Error: {error}</div>
  }
  return (
  <>
      <div>
      <h2>
          <Link to='/'>
            + Plan New Trip
          </Link>
      </h2>
    </div>
    <section className='text-center'>
      {trips.map((trip,index)=> (
      <div key={index} className='mb-6'>
        <Link to={`/trips/${trip.id}`}>
          <h2>
            {trip.destination} Trip 
          </h2>
          <h3>
            Budget: ${trip.budget[0].value}-${trip.budget[1].value}
          </h3>
          <p>
            Start Date: {trip.date_Range[0].value}
          </p>
          <p>
            End Date: {trip.date_Range[1].value}
          </p>
        </Link>
        <br/>
      </div>
       ))}
    </section>
    <br/>
    <h1>
      Suggested Trips
    </h1>

  </>
  );
}