import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import { motion,AnimatePresence } from "motion/react";

function PortugalMap({ listings, city, setCity,width, mode, selectedBrand }) {
    const svgRef = useRef();
    const toolTipRef = useRef();
    const [listingsByDistrict, setListingsByDistrict] = useState([])
    const [toolTip,setToolTip] = useState({visible: false,x:0,y:0,content:""});
    const [toolTipSize,setToolTipSize] = useState({width:0,height:0});
    const legendSvgRef = useRef();


    const toolTipDiv = (cidade, listings, price) => {
        return (
            <div>
                <p>{cidade}</p>
                <p>{listings} listings</p>
                <p>{price} €</p>
            </div>
        )
    }

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

            setListingsByDistrict(listingsByDistrict)

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
              .range(["white", d3.interpolateBlues(1)]);

            const exponentPrice = 2; // Adjust exponent for a non-linear response (0.5 is a square root)
            const colorScalePrice = d3.scalePow()
                .exponent(exponentPrice)
                .domain([0, maxAvgPrice])
                .range(["white", d3.interpolateBlues(1)]);

                const legendSvg = d3.select(legendSvgRef.current)
                .attr('width', width)
                .attr('height', 50);
            
            // Clear the existing legend content to avoid overlapping
            legendSvg.selectAll('*').remove();
            
            const legendWidth = 200;
            const legendHeight = 10;
            
            const defs = legendSvg.append('defs');
            const gradientId = 'legend-gradient';
            
            // Remove existing gradient if any
            defs.select(`#${gradientId}`).remove();
            
            const gradient = defs.append('linearGradient')
                .attr('id', gradientId)
                .attr('x1', '0%')
                .attr('y1', '0%')
                .attr('x2', '100%')
                .attr('y2', '0%');
            
            const colorScaleCurrent = mode === "listings" ? colorScale : colorScalePrice;
            const domainCurrent = mode === "listings" ? [0, maxListings] : [0, maxAvgPrice];
            
            const numStops = 10;
            const step = 1 / (numStops - 1);
            
            for (let i = 0; i < numStops; i++) {
                gradient.append('stop')
                    .attr('offset', `${i * step * 100}%`)
                    .attr('stop-color', colorScaleCurrent(domainCurrent[0] + i * (domainCurrent[1] - domainCurrent[0]) / (numStops - 1)));
            }
            
            legendSvg.append('rect')
                .attr('width', legendWidth)
                .attr('height', legendHeight)
                .style('fill', `url(#${gradientId})`)
                .style('stroke', 'black')
                .style('stroke-width', '1px')
                .attr('transform', `translate(${(width - legendWidth) / 2}, 20)`);
            
            const legendScale = d3.scaleLinear()
                .domain(domainCurrent)
                .range([0, legendWidth]);
            
            const legendAxis = d3.axisBottom(legendScale)
                .ticks(5)
                .tickFormat(d3.format(".2s"));
            
            legendSvg.append('g')
                .attr('transform', `translate(${(width - legendWidth) / 2}, 30)`)
                .call(legendAxis);
            
            legendSvg.append('text')
                .attr('x', width / 2)
                .attr('y', 45)
                .attr('text-anchor', 'middle')
                .attr('font-size', '12px')
                .attr('fill', 'black')
                .attr('transform', `translate(0, -30)`)
                .text(mode === "listings" ? "Number of Listings" : "Average Price (€)");
            

            const height = 600;

            const projection = d3
                .geoMercator()
                .scale(4000)
                .fitSize([width, height], geojson);

            const path = d3.geoPath().projection(projection);

            const svg = d3.select(svgRef.current)
                .attr('width', width)
                .attr('height', height);

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

                    if (mode === "listings"){
                        return colorScale(count);
                    }
                    else if (mode === "average_price"){
                        return colorScalePrice(avgPrice);
                    }
                })
                .style('transition', 'all 0.3s ease')
                .attr('stroke', function(d) {
                    const isSelected = city === d.properties.NAME_1 && listingsByDistrict.get(d.properties.NAME_1);
                    if (isSelected) {
                        d3.select(this).raise();
                    }
                    return isSelected ? 'orange' : 'black';
                })
                .attr('stroke-width', (d) => (city === d.properties.NAME_1 && listingsByDistrict.get(d.properties.NAME_1)) ? 3 : 0.5)
                .on("mouseover",function (e,d) {
                    
                    const districtName = d.properties.NAME_1;
                    const count = listingsByDistrict.get(districtName) || 0;
                    const avgPrice = avgPriceByDistrict.get(districtName) || 0;

                    if (count == 0){
                        return
                    }

                    setToolTip({visible: true,x:e.clientX,y:e.clientY,content:toolTipDiv(districtName,count,Math.round(avgPrice))})
                    d3.select(this)
                        .style('transform', 'translate(0px, -5px)');
                })
                .on("mousemove",(e,d)=>{
                    const districtName = d.properties.NAME_1;
                    const count = listingsByDistrict.get(districtName) || 0;
                    const avgPrice = avgPriceByDistrict.get(districtName) || 0;

                    if (count == 0){
                        return
                    }

                    setToolTip({visible: true,x:e.clientX,y:e.clientY,content:toolTipDiv(districtName,count,Math.round(avgPrice))})
                })
                .on("mouseout",function (){
                    setToolTip({visible: false,x:toolTip.x, y:toolTip.y,content:""})
                    d3.select(this)
                        .style('transform', 'translate(0px, 0px)')
                })
                .on("click", function (event, d) {
                
                    const districtName = d.properties.NAME_1;
                    const count = listingsByDistrict.get(districtName) || 0;
                    
                    if (count == 0){
                        return
                    }
    
                    d3.select(this).raise();
                    if (city === d.properties.NAME_1){
                        setCity("");
                        return
                    }
                    setCity(d.properties.NAME_1);    
                });
        }).catch(error => console.error('Error loading data:', error));
    }, [listings, mode, selectedBrand]);  // Re-run the effect when listings, filter, or selectedBrand change

    useEffect(() => {
        const svg = d3.select(svgRef.current)
        svg.selectAll('path').attr('stroke', (d) => (city === d.properties.NAME_1) ? 'orange' : 'black')
                            .attr('stroke-width', (d) => (city === d.properties.NAME_1) ? 3 : 0.5)
            .on("click", function (event, d) {

                const districtName = d.properties.NAME_1;
                const count = listingsByDistrict.get(districtName) || 0;
                
                if (count == 0){
                    return
                }

                d3.select(this).raise();
                if (city === d.properties.NAME_1){
                    setCity("");
                    return
                }
                setCity(d.properties.NAME_1);    
            });
        
    }, [svgRef.current,city]);

    useEffect(() => {
        if(!toolTipRef.current) return
        setToolTipSize({width:toolTipRef.current.offsetWidth,height:toolTipRef.current.offsetHeight})
    }, [toolTipRef.current])

    return (
        <div>
            <div style={{ flex: 1 }}>
                <svg ref={svgRef}></svg>
            </div>
            <svg ref={legendSvgRef}></svg>
            <AnimatePresence>
                {toolTip.visible && 
                <motion.div className="fixed bg-gray-200 p-2 rounded-md" ref={toolTipRef}
                    style={{top:toolTip.y - 80,left:toolTip.x - toolTipSize.width/2, pointerEvents:"none"}}
                    entry={{opacity:1,y:-10}}
                    animate={{y:0,opacity:1}}
                    exit={{opacity:0,y:-10}}
                >
                    {toolTip.content}
                </motion.div>
                }
            </AnimatePresence>
        </div>
    );
    
}

export default PortugalMap;
