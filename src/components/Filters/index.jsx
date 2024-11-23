function Filters({ setBrand,brand,mode,setMode,listings }) {
    const brands = [...new Set(listings.map((listing) => listing.Brand))];

    return (
        <div style={{ width: "250px", paddingLeft: "20px" }}>
            <div>
                <label>
                    <input
                        type="radio"
                        value="listings"
                        checked={mode === "listings"}
                        onChange={() => setMode("listings")}
                    />
                    Listings
                </label>
                <br />
                <label>
                    <input
                        type="radio"
                        value="average_price"
                        checked={mode === "average_price"}
                        onChange={() => setMode("average_price")}
                    />
                    Average Price
                </label>
            </div>

            {/* Dropdown for selecting brand */}
            <div style={{ marginTop: "20px" }}>
                <label htmlFor="brand-select">Select Brand:</label>
                <select
                    id="brand-select"
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
