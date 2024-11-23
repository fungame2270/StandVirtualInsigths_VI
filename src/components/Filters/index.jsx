function Filters({ setBrand, brand, mode, setMode, listings }) {
    const brands = [...new Set(listings.map((listing) => listing.Brand))];

    return (
        <div className="w-64 p-4">
            {/* Mode Toggle Buttons */}
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

            {/* Dropdown for selecting brand */}
            <div className="mt-4">
                <label htmlFor="brand-select" className="block text-sm font-medium text-gray-700">
                    Select Brand:
                </label>
                <select
                    id="brand-select"
                    className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
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
