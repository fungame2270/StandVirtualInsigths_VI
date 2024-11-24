function Filters({ setBrand, brand, mode, setMode, listings }) {
    const brands = [...new Set(listings.map((listing) => listing.Brand))];

    return (
        <div className="w-full p-4 flex justify-center items-center gap-4">
            {/* Mode Toggle Buttons */}
            <div>
                <label htmlFor="brand-select" className="block text-sm font-medium text-gray-700">
                    Select Mode:
                </label>
                <div className="flex space-x-2">
                    <button
                        className={`px-4 py-2 text-sm font-medium rounded ${
                            mode === "listings"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 text-gray-700"
                        }`}
                        onClick={() => setMode("listings")}
                    >
                        Listings
                    </button>
                    <button
                        className={`px-4 py-2 text-sm font-medium rounded ${
                            mode === "average_price"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 text-gray-700"
                        }`}
                        onClick={() => setMode("average_price")}
                    >
                        Average Price
                    </button>
                </div>
            </div>

            {/* Dropdown for selecting brand */}
            <div className="">
                <label htmlFor="brand-select" className="block text-sm font-medium text-gray-700">
                    Select Brand:
                </label>
                <select
                    id="brand-select"
                    className="block w-full rounded bg-white px-4 py-2  border-gray-800 border-2 shadow-sm"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value !== "All Brands" ? e.target.value : "")}
                >
                    <option value="">All Brands</option>
                    {brands.map((brand, index) => (
                        <option key={index} value={brand}>
                            {brand}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}

export default Filters;
