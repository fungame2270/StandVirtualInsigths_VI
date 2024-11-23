import { useState } from "react";

function ModalListings({listings, selectedcity, selectedbrand,setSelectedcity}) {
    const [filter, setFilter] = useState("");

    if (selectedcity !== "") {
    return (
        <div className="fixed bg-black bg-opacity-50 top-0 left-0 right-0 bottom-0 h-screen w-full">
            <div className="bg-white w-[80%] h-[80%] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-md p-2">
                <div className="flex justify-between p-2 h-[10%]">
                   <div>
                        <h2 className="text-2xl font-bold h-[50%]">Listings</h2>
                        <input className="border border-gray-300 bg-white p-2 rounded-md h-[50%]" type="text" placeholder="Search..." value={filter} onChange={(e) => setFilter(e.target.value)} />
                    </div> 
                    <button className=" bg-gray-500 rounded-sm h-[50%] text-white aspect-square flex justify-center items-center" onClick={() => {setSelectedcity("");setFilter("")}}  >X</button>
                </div>
                <div className="flex h-[90%]">
                    <div className="overflow-scroll w-full">
                        {listings.map((listing) => { 
                            if (listing.City === selectedcity && (listing.Brand === selectedbrand || selectedbrand === "") && listing.Title.toLowerCase().includes(filter.toLowerCase())) {
                                return(
                                    <div className="border border-gray-300 p-4 rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                                        <div className="space-y-2">
                                            <h2 className="text-lg font-semibold">
                                                {listing.Title} • {listing.Price} €
                                            </h2>
                                            <p className="text-sm text-gray-500">
                                                {listing.EngineSize !== "N/A" && `${listing.EngineSize} cm³ •`} {listing.Horsepower} Hp
                                            </p>
                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                <p>{listing.Kilometer} km</p>
                                                <p>{listing.GasType}</p>
                                                <p>{listing.GearBox}</p>
                                                <p>{listing.Year}</p>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                <p>{listing.Location}</p>
                                                <p>{listing.Published}</p>
                                            </div>
                                            <p>{listing.Seller}</p>
                                        </div>
                                    </div>
                                )
                            }
                        }
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
    }else{
        return(<></>)
    }
}

export default ModalListings;