export default function Overview({trip}){
    return(
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
            {/*Main summary*/}
            <div clssNmae="rounded-2x1 border-slate-200 bg-white p-8 shadow-sm">
                <h2 className="text-x! font-semibold text-(--text-h)">
                    Voyager AI Summary
                </h2>
                <p className="mt-4 text-base leading-7 text-slate-600">
                    {trip.summary || "No trip summary available yet."}

                </p>
                <div className="mt-8 grid gap-6 sm:grid-cols-3">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Destination
                        </p>
                        <p className="mt-1 font-semibold text-(--text-h">
                            {trip.destination}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Dates
                        </p>
                        <p className="mt-1 font-semibold text-(--text-h)">
                            {trip.date_Range[0].value} - {trip.date_Range[1].value}

                        </p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Budget
                        </p>
                        <p className="text-xs font-semibold text-(--text-h)">
                            ${Number(trip.budget).toFixed(2)}
                        </p>
                    </div>

                </div>

            </div>
            {/*Trip details*/}
            <div className="rounded-2x1 border-slate-200 bg-white p-8 shadow-sm">
                <h2 className="text-x1 font-semibold text-(--text-h)"> Trip Details 
                
                </h2>
                <div className="mt-6 space-y-5">
                    <div>
                        <p className="text-sm text-slate-400"> Destination</p>
                        <p className="mt-1 font-medium text-(--text-h)">{trip.destination}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-400">Travel Dates</p>
                        <p className="mt-1 font-medium text-(--text-h)">{trip.date_Range[0].value} - {trip.date_Range[1].value}</p>
                    </div>

                    <div>
                        <p className="text-sm text-slate-400">Budget</p>
                        <p className="mt-1 font-medium text-(--text-h)">
                            ${Number(trip.budget).toFixed(2)}
                        </p>
                    </div>

                </div>

            </div>

        </div>
    )
}