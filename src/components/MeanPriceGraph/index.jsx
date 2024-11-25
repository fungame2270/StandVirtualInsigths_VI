import { useRef, useState, useEffect } from "react";
import * as d3 from 'd3';
import { AnimatePresence, motion } from "motion/react";

function MeanPriceGraph({data, columns, city, width, mode}) {
    const svgRef = useRef();
    const toolTipRef = useRef();
    const height = 400;
    const [column,setColumn] = useState("Seller")
    const [toolTip,setToolTip] = useState({visible: false,x:0,y:0,content:""});
    const [toolTipSize,setToolTipSize] = useState({width:0,height:0});

    const toolTipDiv = (listings, price,Title) => {
        return (
            <div>
                <p>{Title}</p>
                <p>{price} €</p>
                <p>{listings} listings</p>
            </div>
        )
    }

    useEffect(() => {
        const margin = {top:20, right: 20, bottom: 40, left: 80};
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const groupedData = d3.group(data, (d) => d[column]);
        let aggregatedData;
        aggregatedData = Array.from(groupedData, ([key, values]) => ({
            Title: key,
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
            aggregatedData.sort((a, b) => b.Price - a.Price);
            
            yScale = d3
            .scaleLinear()
            .domain([0, d3.max(aggregatedData, (d) => d.Price)])
            .nice()
            .range([innerHeight, 0]);
            
            yFunct = (d) => yScale(d.Price);
            heightFunct = (d) => innerHeight - yScale(d.Price);
        }

        // Set up scales
        const xScale = d3
        .scaleBand()
        .domain(aggregatedData.map((d) => d.Title))
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
            .on("mouseover",(e,d)=>{
                const cityData = aggregatedData.find(item => item.Title === d);
                setToolTip({visible: true,x:e.clientX,y:e.clientY,content:toolTipDiv(cityData.listings,Math.round(cityData.Price))})
            })
            .on("mousemove",(e,d)=>{
                const cityData = aggregatedData.find(item => item.Title === d);
                setToolTip({visible: true,x:e.clientX,y:e.clientY,content:toolTipDiv(cityData.listings,Math.round(cityData.Price))})
            })
            .on("mouseout",()=>setToolTip({visible: false,x:toolTip.x, y:toolTip.y,content:""}));


        chartGroup
            .append("g")
            .call(d3.axisLeft(yScale).tickValues(yScale.ticks().filter((d) => Number.isInteger(d)))
            .tickFormat((d) => (mode === "listings" ? `${d}` : `${d} €`)))
            .selectAll("text")
            .attr("fill", "black");

        // Draw axis labels
        //Labels
        chartGroup
            .append("text")
            .attr("x", innerWidth / 2) // Center the label horizontally
            .attr("y", innerHeight + 33) // Position below the axis
            .attr("text-anchor", "middle") // Center align the text
            .attr("fill", "black") // Text color
            .text(column); // The label text
        
        chartGroup
            .append("text")
            .attr("x", - innerHeight / 2) // Center the label horizontally
            .attr("y", mode === "listings" ? -50 : -60) // Position below the axis
            .attr("text-anchor", "middle") // Center align the text
            .attr("transform", "rotate(-90)")
            .attr("fill", "black") // Text color
            .text(mode === "listings" ? "Listings" : "Average Price"); // The label text

        // Draw bars
        chartGroup
            .selectAll(".bar")
            .data(aggregatedData)
            .enter()
            .append("rect")
            .attr("x", (d) => xScale(d.Title))
            .attr("y", yFunct)
            .attr("width", xScale.bandwidth())
            .attr("height", heightFunct)
            .attr("fill", "steelblue")
            .on("mouseover",(e,d)=>{
                setToolTip({visible: true,x:e.clientX,y:e.clientY,content:toolTipDiv(d.listings,Math.round(d.Price),d.Title)})
            })
            .on("mousemove",(e,d)=>{
                setToolTip({visible: true,x:e.clientX,y:e.clientY,content: toolTipDiv(d.listings,Math.round(d.Price),d.Title)})
            })
            .on("mouseout",()=>setToolTip({visible: false,x:toolTip.x, y:toolTip.y,content:""}));
        // Draw bars
    }, [data, width, height,column, mode]);

    useEffect(() => {
        if(!toolTipRef.current) return
        setToolTipSize({width:toolTipRef.current.offsetWidth,height:toolTipRef.current.offsetHeight})
    }, [toolTipRef.current])


    return(
        <>
        <div className="flex flex-col items-center">
            <div className="flex gap-2 justify-between" style={{ width: width }}>
            <div className="text-3xl">{mode === "listings" ? "Listings" : "Average Price"} by {column} for {city || "Portugal"}</div>
                <select onChange={(e) => setColumn(e.target.value)} value={column} className="rounded-md p-1 border-2 border-gray-400 bg-white">
                    {columns.map((column) => (
                        <option key={column} value={column}>{column}</option>
                    ))}
                </select>
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

export default MeanPriceGraph;