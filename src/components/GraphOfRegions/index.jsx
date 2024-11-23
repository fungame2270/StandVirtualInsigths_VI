import { useRef, useState, useEffect } from "react";
import * as d3 from 'd3';
import { AnimatePresence, motion } from "motion/react";

function GraphOfRegions({data, columns, city,width, mode, setCurrentCity}) {
    const svgRef = useRef();
    const toolTipRef = useRef();
    const height = 600;
    const [toolTip,setToolTip] = useState({visible: false,x:0,y:0,content:""});
    const [toolTipSize,setToolTipSize] = useState({width:0,height:0});

    const toolTipDiv = (listings, price) => {
        return (
            <div>
                <p>{price} €</p>
                <p>{listings} listings</p>
            </div>
        )
    }

    useEffect(() => {
        const margin = {top:20, right: 20, bottom: 50, left: 50};
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const groupedData = d3.group(data, (d) => d.City);
        let aggregatedData;
        aggregatedData = Array.from(groupedData, ([key, values]) => ({
            City: key,
            Price: d3.mean(values, (d) => d.Price),
            listings: d3.count(values,() => true),
        }));

        // Set up scales & functions to draw y
        let yScale;
        let yFunct;
        let heightFunct;
        if (mode === "listings") {
            aggregatedData.sort((a, b) => {
                if (a.City === city) {
                    return -1
                }
                if (b.City === city) {
                    return 1
                }
                return b.listings - a.listings
            });
            
            
            yScale = d3
            .scaleLinear()
            .domain([0, d3.max(aggregatedData, (d) => d.listings)])
            .nice()
            .range([innerHeight, 0]);
            
            yFunct = (d) => yScale(d.listings);
            heightFunct = (d) => innerHeight - yScale(d.listings);
        } else {
            aggregatedData.sort((a, b) => {
                if (a.City === city) {
                    return -1
                }
                if (b.City === city) {
                    return 1
                }
                return b.Price - a.Price
            });            
            yScale = d3
            .scaleLinear()
            .domain([0, d3.max(aggregatedData, (d) => d.Price)])
            .nice()
            .range([innerHeight, 0]);
            
            yFunct = (d) => yScale(d.Price);
            heightFunct = (d) => innerHeight - yScale(d.Price);
        }
        
        const xScale = d3
        .scaleBand()
        .domain(aggregatedData.map((d) => d.City))
        .range([0, innerWidth])
        .padding(0.2);

        const chartGroup = svg
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Add axes
        chartGroup
            .append("g")
            .call(d3.axisBottom(xScale))
            .attr("transform", `translate(0, ${innerHeight})`)
            .selectAll("text")
            .attr("fill", "black")
            .style("text-anchor", "middle") // Center align the text
            .attr("transform", "translate(0,6)")
            .on("mouseover",(e,d)=>{
                const cityData = aggregatedData.find(item => item.City === d);
                setToolTip({visible: true,x:e.clientX,y:e.clientY,content:toolTipDiv(cityData.listings,Math.round(cityData.Price))})
            })
            .on("mousemove",(e,d)=>{
                const cityData = aggregatedData.find(item => item.City === d);
                setToolTip({visible: true,x:e.clientX,y:e.clientY,content:toolTipDiv(cityData.listings,Math.round(cityData.Price))})
            })
            .on("mouseout",()=>setToolTip({visible: false,x:toolTip.x, y:toolTip.y,content:""}))
            .each(function () {
                const text = d3.select(this);
                const words = text.text().split(" ");
                text.text(""); // Clear the current text
                words.forEach((word, i) => {
                    text.append("tspan")
                        .text(word)
                        .attr("x", 0) // Keep text centered
                        .attr("dy", i === 0 ? 0 : "1.2em"); // Add spacing between lines
                });
            });


        chartGroup
            .append("g")
            .call(d3.axisLeft(yScale).tickFormat(d => (mode === "listings" ? `${d}` : `${d} €`)))
            .selectAll("text")
            .attr("fill", "black");

        // Draw bars
        chartGroup
            .selectAll(".bar")
            .data(aggregatedData)
            .enter()
            .append("rect")
            .attr("x", (d) => xScale(d.City))
            .attr("y", yFunct)
            .attr("width", xScale.bandwidth())
            .attr("height", heightFunct)
            .attr("fill", (d) => d.City === city ? "#324ca8" : "steelblue")
            .on("mouseover",(e,d)=>{
                setToolTip({visible: true,x:e.clientX,y:e.clientY,content:toolTipDiv(d.listings,Math.round(d.Price))})
            })
            .on("mousemove",(e,d)=>{
                setToolTip({visible: true,x:e.clientX,y:e.clientY,content: toolTipDiv(d.listings,Math.round(d.Price))})
            })
            .on("mouseout",()=>setToolTip({visible: false,x:toolTip.x, y:toolTip.y,content:""}))
            .on("click", (e, d) => {
                setCurrentCity(d.City)
                setToolTip({visible: false,x:toolTip.x, y:toolTip.y,content:""})
            })
        // Draw bars
    }, [data, width, height, mode, city]);

    useEffect(() => {
        if(!toolTipRef.current) return
        setToolTipSize({width:toolTipRef.current.offsetWidth,height:toolTipRef.current.offsetHeight})
    }, [toolTipRef.current])


    return(
        <>
        <div className="flex flex-col items-center" style={{width: width}}>
            <div className="flex">
                <div className="ml-auto text-4xl">Data Across Regions</div>
            </div>
            <svg ref={svgRef} width={width} height={height} />
        </div>
        <AnimatePresence>
            {toolTip.visible && 
            <motion.div className="fixed bg-gray-200 p-2 rounded-md" ref={toolTipRef}
                style={{top:toolTip.y - 60,left:toolTip.x - toolTipSize.width/2, pointerEvents:"none"}}
                entry={{opacity:1,y:-10}}
                animate={{y:0,opacity:1}}
                exit={{opacity:0,y:-10}}
            >
                {toolTip.content}
            </motion.div>
        }
        </AnimatePresence>
        </>
    )
}

export default GraphOfRegions;