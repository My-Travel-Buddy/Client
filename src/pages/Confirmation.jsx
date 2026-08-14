import { useLocation } from "react-router"
import { useState } from "react";
import { createTrip, createActivity, createChecklistItem } from "../api/client";

export default function Confirmation() {

    const location = useLocation();
    const [message,setMessage] = useState("")

    const {itinerary} = location.state;
    console.log(itinerary)

    async function handleSaveTrip() {
        
        console.log("SAVE BUTTON CLICKED");
    
        if (!itinerary) {
          return;
        }
    
        try {
          setMessage("Saving trip...");
    
          // I convert that string into numbers before sending it:
          if (itinerary.budget < 0 ) {
            setMessage("Enter budget as minimum 0");
            return;
          }
          // Then I send that array to the backend:
          const savedTrip = await createTrip({
            destination: itinerary.destination,
            date_Range: [itinerary.startDate, itinerary.endDate],
            budget: itinerary.budget,
          });
    
          const tripId = savedTrip.id;
    
          // Save every generated activity.
          for (const activity of itinerary.activities || []) {
            await createActivity(tripId, {
              title: activity.title,
              category: activity.category,
              dateTime: activity.dateTime,
              estimatedCost: activity.estimatedCost,
              notes: activity.notes,
            });
          }
    
          // Save every generated checklist item.
          for (const item of itinerary.checklist || []) {
            await createChecklistItem(tripId,{
              text: item,
              completed: false
            });

          }
    
          setMessage("Trip saved successfully!");
    
        } catch (error) {
          setMessage(error.message);
        }
      }

  return (

    <>
    <div>Confirm Itinerary</div>

        {itinerary && (
        <section className="mt-8">
          <h2 className="mb-2 text-2xl font-bold">{itinerary.title}</h2>

          <p className="mb-4 text-gray-600">{itinerary.summary}</p>

          {itinerary.hasMoreDays && (
            <p className="mb-4">
              Your trip is {itinerary.tripDays} days. We generated the first{" "}
              {itinerary.generatedDays} days.
            </p>
          )}

          <h3 className="mb-3 text-xl font-semibold">Activities</h3>

          <div className="space-y-4">
            {(itinerary.activities || []).map((activity, index) => (
              <div
                key={index}
                className="rounded-md border border-gray-200 bg-white p-4"
              >
                {/* {console.log(activity)} */}

                <h4 className="mb-2 font-semibold">
                  Day {activity.day}: {activity.title}
                </h4>

                <p>Time: {new Date(activity.dateTime).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
                })}
                </p>
                <p>Category: {activity.category}</p>
                <p>Estimated Cost: ${activity.estimatedCost}</p>
                <p className="mt-2">{activity.notes}</p>
              </div>
            ))}
          </div>

          <h3 className="mb-2 mt-6 text-xl font-semibold">Checklist</h3>

          <ul className="list-disc pl-6">
            {(itinerary.checklist || []).map((item, index) => (
              <li key={index}>
                {item}
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={handleSaveTrip}
            className="mt-6 rounded-md bg-green-600 px-4 py-2 text-white"
          >
            Save Trip
          </button>
        </section>
      )}
    </>
  )
}
