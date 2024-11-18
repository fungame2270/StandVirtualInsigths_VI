import { useRef, useState, useEffect } from "react";
import * as d3 from 'd3';
import { AnimatePresence, motion } from "motion/react";

function MeanPriceGraph({data, columns, city}) {
    const svgRef = useRef();
    const toolTipRef = useRef();
    const width = window.innerWidth * 0.8;
    const height = 400;
    const [mode,setMode] = useState("Seller")
    const [toolTip,setToolTip] = useState({visible: false,x:0,y:0,content:""});
    const [toolTipSize,setToolTipSize] = useState({width:0,height:0});

    const toolTipDiv = (listnings, price) => {
        return (
            <div>
                <p>{price} €</p>
                <p>{listnings} listnings</p>
            </div>
        )
    }

    useEffect(() => {
        const margin = {top:20, right: 20, bottom: 40, left: 50};
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const groupedData = d3.group(data, (d) => d[mode]);
        let aggregatedData;
        aggregatedData = Array.from(groupedData, ([key, values]) => ({
            Title: key,
            Price: d3.mean(values, (d) => d.Price),
            listnings: d3.count(values,() => true),
        }));

        aggregatedData.sort((a, b) => b.Price - a.Price);

        // Set up scales
        const xScale = d3
        .scaleBand()
        .domain(aggregatedData.map((d) => d.Title))
        .range([0, innerWidth])
        .padding(0.2);

        const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(aggregatedData, (d) => d.Price)])
        .nice()
        .range([innerHeight, 0]);

        const chartGroup = svg
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Add axes
        chartGroup
            .append("g")
            .call(d3.axisBottom(xScale))
            .attr("transform", `translate(0, ${innerHeight})`)
            .selectAll("text")
            .attr("fill", "black");

        chartGroup
            .append("g")
            .call(d3.axisLeft(yScale).tickFormat(d => `${d} €`))
            .selectAll("text")
            .attr("fill", "black");

        // Draw bars
        chartGroup
            .selectAll(".bar")
            .data(aggregatedData)
            .enter()
            .append("rect")
            .attr("x", (d) => xScale(d.Title))
            .attr("y", (d) => yScale(d.Price))
            .attr("width", xScale.bandwidth())
            .attr("height", (d) => innerHeight - yScale(d.Price))
            .attr("fill", "steelblue")
            .on("mouseover",(e,d)=>{
                setToolTip({visible: true,x:e.clientX,y:e.clientY,content:toolTipDiv(d.listnings,Math.round(d.Price))})
            })
            .on("mousemove",(e,d)=>{
                setToolTip({visible: true,x:e.clientX,y:e.clientY,content: toolTipDiv(d.listnings,Math.round(d.Price))})
            })
            .on("mouseout",()=>setToolTip({visible: false,x:toolTip.x, y:toolTip.y,content:""}));
        // Draw bars
    }, [data, width, height,mode]);

    useEffect(() => {
        if(!toolTipRef.current) return
        setToolTipSize({width:toolTipRef.current.offsetWidth,height:toolTipRef.current.offsetHeight})
    }, [toolTipRef.current])


    return(
        <>
        <div className="flex flex-col items-center">
            <div className="flex w-[600px]">
                <div className="ml-auto">Mean Price by {mode} for {city}</div>
                <select onChange={(e) => setMode(e.target.value)} value={mode} className="rounded-md p-1 bg-gray-400 ml-auto">
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