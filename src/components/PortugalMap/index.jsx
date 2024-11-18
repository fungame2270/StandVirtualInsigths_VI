import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';

function PortugalMap({ listings, setCity }) {
    const svgRef = useRef();
    const [filter, setFilter] = useState("listings");
    const [selectedBrand, setSelectedBrand] = useState(""); // State to track selected brand

    // Get a unique list of brands from the listings data
    const brands = [...new Set(listings.map(listing => listing.Brand))];

    useEffect(() => {
        // Filter listings by the selected brand
        const filteredListings = selectedBrand
            ? listings.filter(listing => listing.Brand === selectedBrand)
            : listings; // If no brand is selected, show all listings

        d3.json('/portugal-districts.json').then((topology) => {
            const geojson = feature(topology, topology.objects.ilhasGeo2);

            const listingsByDistrict = d3.rollup(
                filteredListings,
                v => v.length,
                d => d.City
            );

            const avgPriceByDistrict = d3.rollup(
                filteredListings,
                v => d3.mean(v, d => d.Price),
                d => d.City
            );

            const maxListings = d3.max(Array.from(listingsByDistrict.values()));
            const maxAvgPrice = d3.max(Array.from(avgPriceByDistrict.values()));

            const exponent = 0.3; // Adjust exponent for a non-linear response (0.5 is a square root)
            const colorScale = d3.scalePow()
              .exponent(exponent)
              .domain([0, maxListings])
              .range([d3.interpolateGreys(0), d3.interpolateGreys(1)]);

            const exponentPrice = 2; // Adjust exponent for a non-linear response (0.5 is a square root)
            const colorScalePrice = d3.scalePow()
                .exponent(exponentPrice)
                .domain([0, maxAvgPrice])
                .range([d3.interpolateGreys(0), d3.interpolateGreys(1)]);

            const width = 400;
            const height = 600;

            const projection = d3
                .geoMercator()
                .scale(4000)
                .fitSize([width, height], geojson);

            const path = d3.geoPath().projection(projection);

            const svg = d3.select(svgRef.current)
                .attr('width', width)
                .attr('height', height);

            const tooltip = d3.select('body').append('div')
                .attr('class', 'tooltip')
                .style('position', 'absolute')
                .style('padding', '8px')
                .style('background', 'rgba(0, 0, 0, 0.7)')
                .style('color', '#fff')
                .style('border-radius', '4px')
                .style('pointer-events', 'none')
                .style('opacity', 0);

            svg.selectAll('path')
                .data(geojson.features)
                .join('path')
                .attr('d', path)
                .attr('stroke', 'black')
                .attr('stroke-width', 0.5)
                .attr('fill', d => {
                    const districtName = d.properties.NAME_1;
                    const count = listingsByDistrict.get(districtName) || 0;
                    const avgPrice = avgPriceByDistrict.get(districtName) || 0;

                    if (filter === "listings"){
                        return colorScale(count);
                    }
                    else if (filter === "average_price"){
                        return colorScalePrice(avgPrice);
                    }
                })
                .style('transition', 'all 0.3s ease')
                .on('mouseover', function (event, d) {
                    const districtName = d.properties.NAME_1;
                    const count = listingsByDistrict.get(districtName) || 0;
                    const avgPrice = avgPriceByDistrict.get(districtName) || 0;

                    tooltip.style('opacity', 1)
                        .html(`<strong>${districtName}</strong><br>Listings: ${count}<br>Average Price: ${Math.round(avgPrice)}€`)
                        .style('left', `${event.pageX + 10}px`)
                        .style('top', `${event.pageY + 10}px`);

                    d3.select(this)
                        .style('transform', 'translate(0px, -2px)')
                        .raise();
                })
                .on('mousemove', function (event) {
                    tooltip.style('left', `${event.pageX + 10}px`)
                        .style('top', `${event.pageY + 10}px`);
                })
                .on('mouseout', function () {
                    tooltip.style('opacity', 0);
                    d3.select(this)
                        .attr('stroke-width', 0.5)
                        .style('transform', 'scale(1)')
                        .style('filter', 'none');
                })
                .on("click", function (event, d) {
                    setCity(d.properties.NAME_1);    
                });
        }).catch(error => console.error('Error loading data:', error));
    }, [listings, filter, selectedBrand]);  // Re-run the effect when listings, filter, or selectedBrand change

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ flex: 1 }}>
                <svg ref={svgRef}></svg>
            </div>
            <div style={{ width: '250px', paddingLeft: '20px' }}>
                <div>
                    <label>
                        <input
                            type="radio"
                            value="listings"
                            checked={filter === "listings"}
                            onChange={() => setFilter("listings")}
                        />
                        Listings
                    </label>
                    <br />
                    <label>
                        <input
                            type="radio"
                            value="average_price"
                            checked={filter === "average_price"}
                            onChange={() => setFilter("average_price")}
                        />
                        Average Price
                    </label>
                </div>

                {/* Dropdown for selecting brand */}
                <div style={{ marginTop: '20px' }}>
                    <label htmlFor="brand-select">Select Brand:</label>
                    <select
                        id="brand-select"
                        value={selectedBrand}
                        onChange={(e) => setSelectedBrand(e.target.value)}
                    >
                        <option value="">All Brands</option>
                        {brands.map((brand, index) => (
                            <option key={index} value={brand}>{brand}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}

export default PortugalMap;
