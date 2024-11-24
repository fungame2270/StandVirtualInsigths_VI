import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import { motion,AnimatePresence } from "motion/react";

function PortugalMap({ listings, city, setCity,width, mode, selectedBrand }) {
    const svgRef = useRef();
    const toolTipRef = useRef();
    const [toolTip,setToolTip] = useState({visible: false,x:0,y:0,content:""});
    const [toolTipSize,setToolTipSize] = useState({width:0,height:0});

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

                    if (mode === "listings"){
                        return colorScale(count);
                    }
                    else if (mode === "average_price"){
                        return colorScalePrice(avgPrice);
                    }
                })
                .style('transition', 'all 0.3s ease')
                .on("mouseover",function (e,d) {
                    
                    console.log(d.listings)
                    const districtName = d.properties.NAME_1;
                    const count = listingsByDistrict.get(districtName) || 0;
                    const avgPrice = avgPriceByDistrict.get(districtName) || 0;

                    if (count == 0){
                        return
                    }

                    setToolTip({visible: true,x:e.clientX,y:e.clientY,content:toolTipDiv(districtName,count,Math.round(avgPrice))})
                    d3.select(this)
                        .style('transform', 'translate(0px, -5px)')
                        .raise();
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
                    setCity(d.properties.NAME_1);    
                });
        }).catch(error => console.error('Error loading data:', error));
    }, [listings, mode, selectedBrand]);  // Re-run the effect when listings, filter, or selectedBrand change

    useEffect(() => {
        const svg = d3.select(svgRef.current)
        svg.selectAll('path').attr('stroke', (d) => (city === d.properties.NAME_1) ? '#324ca8' : 'black')
                            .attr('stroke-width', (d) => (city === d.properties.NAME_1) ? 5 : 0.5)
            .on("click", function (event, d) {
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
