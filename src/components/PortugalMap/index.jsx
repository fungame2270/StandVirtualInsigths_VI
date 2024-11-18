import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';

function PortugalMap({ listings, setCity }) {
    const svgRef = useRef();

    useEffect(() => {

        d3.json('/portugal-districts.json').then((topology) => {

            const geojson = feature(topology, topology.objects.ilhasGeo2);

            const listingsByDistrict = d3.rollup(
                listings,
                v => v.length,
                d => d.City
            );

            const maxListings = d3.max(Array.from(listingsByDistrict.values()));

            const exponent = 0.4; // Adjust exponent for a non-linear response (0.5 is a square root)
            const colorScale = d3.scalePow()
              .exponent(exponent)
              .domain([0, maxListings])
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
                // .style('background-color', '#e0f7fa');

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
                    return colorScale(count);
                })
                .style('transition', 'all 0.3s ease')
                .on('mouseover', function (event, d) {
                    const districtName = d.properties.NAME_1;
                    const count = listingsByDistrict.get(districtName) || 0;

                    tooltip
                        .style('opacity', 1)
                        .html(`<strong>${districtName}</strong><br>Listings: ${count}`)
                        .style('left', `${event.pageX + 10}px`)
                        .style('top', `${event.pageY + 10}px`);

                    d3.select(this)
                        .style('transform', 'translate(0px, -2px)')
                        .raise();

                })
                .on('mousemove', function (event) {
                    tooltip
                        .style('left', `${event.pageX + 10}px`)
                        .style('top', `${event.pageY + 10}px`);
                })
                .on('mouseout', function (event, d) {
                    const districtName = d.properties.NAME_1;
                    const count = listingsByDistrict.get(districtName) || 0;

                    tooltip.style('opacity', 0);

                    d3.select(this)
                        .attr('fill', colorScale(count))
                        .attr('stroke-width', 0.5)
                        .style('transform', 'scale(1)')
                        .style('filter', 'none');
                })
                .on("click", function (event, d) {
                    console.log(d)
                    setCity(d.properties.NAME_1);    
                });
        }).catch(error => console.error('Error loading data:', error));
    }, [listings]);

    return <svg ref={svgRef}></svg>;
}

export default PortugalMap;