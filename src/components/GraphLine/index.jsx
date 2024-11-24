import { useRef, useState, useEffect } from "react";
import * as d3 from "d3";
import { AnimatePresence, motion } from "framer-motion";

function GraphLine({ data, columns, city, width, mode }) {
    const svgRef = useRef();
    const toolTipRef = useRef();
    const height = 400;
    const [column, setColumn] = useState(columns[0]);
    const [toolTip, setToolTip] = useState({ visible: false, x: 0, y: 0, content: "" });
    const [toolTipSize, setToolTipSize] = useState({ width: 0, height: 0 });

    const dataProcessor = (data,column) => {
        if (column === "EngineSize") {
            const round = (value) => {
                return Math.round(value / 100) *100;
            };
            
            let retdata = data.filter((d) => d.EngineSize !== "N/A").map((d) => {
                return {
                    ...d,
                    EngineSize: round(d[column]),
                };
            });
            return retdata;
        }
        if (column === "Horsepower") {
            const round = (value) => {
                return Math.round(value / 10) * 10;
            };
            
            let retdata = data.filter((d) => (d.Horsepower !== "N/A" && !isNaN(d.Horsepower))).map((d) => {
                return {
                    ...d,
                    Horsepower: round(d[column]),
                };
            });
            return retdata;
        }
        if (column === "Kilometer") {
            const round = (value) => {
                return Math.round(value / 10000) * 10000;
            };  
    
            let retdata = data.map((d) => {
                return {
                    ...d,
                    Kilometer: round(d.Kilometer),
                };
            });
            return retdata;
        }
        return data;
    }

    const toolTipDiv = (listings, price, Title) => {
        return (
            <div>
                <p>{Title} {column}</p>
                <p>{price} €</p>
                <p>{listings} listings</p>
            </div>
        );
    };

    useEffect(() => {
        const margin = { top: 20, right: 20, bottom: 40, left: 50 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const dataToUse = dataProcessor(data, column);

        const groupedData = d3.group(dataToUse, (d) => d[column]);

        const aggregatedData = Array.from(groupedData, ([key, values]) => ({
            Title: key,
            Price: d3.mean(values, (d) => d.Price),
            listings: d3.count(values, () => true),
        }));

        aggregatedData.sort((a,b) => a.Title - b.Title);

        const yScale = d3
            .scaleLinear()
            .domain([0, d3.max(aggregatedData, (d) => (mode === "listings" ? d.listings : d.Price))])
            .nice()
            .range([innerHeight, 0]);

        const xScale = d3
            .scalePoint()
            .domain(aggregatedData.map((d) => d.Title))
            .range([0, innerWidth])
            .padding(0.5);

        const line = d3
            .line()
            .x((d) => xScale(d.Title))
            .y((d) => yScale(mode === "listings" ? d.listings : d.Price));

        const chartGroup = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

        // Add axes
        const xTickValues = aggregatedData
            .map((d) => d.Title)
            .filter((d, i) => i % 2 === 0); // Adjust the divisor (10) to control density

        chartGroup
            .append("g")
            .call(d3.axisBottom(xScale).tickValues(xTickValues))
            .attr("transform", `translate(0, ${innerHeight})`)
            .selectAll("text")
            .attr("fill", "black")


        chartGroup
            .append("g")
            .call(d3.axisLeft(yScale).tickFormat((d) => (mode === "listings" ? `${d}` : `${d} €`)))
            .selectAll("text")
            .attr("fill", "black");

        // Add line path
        chartGroup
            .append("path")
            .datum(aggregatedData)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2)
            .attr("d", line);

        // Add points
        chartGroup
            .selectAll(".point")
            .data(aggregatedData)
            .enter()
            .append("circle")
            .attr("class", "point")
            .attr("cx", (d) => xScale(d.Title))
            .attr("cy", (d) => yScale(mode === "listings" ? d.listings : d.Price))
            .attr("r", 4)
            .attr("fill", "steelblue")
            .on("mouseover", (e, d) => {
                setToolTip({
                    visible: true,
                    x: e.clientX,
                    y: e.clientY,
                    content: toolTipDiv(d.listings, Math.round(d.Price),d.Title),
                });
            })
            .on("mousemove", (e, d) => {
                setToolTip({
                    visible: true,
                    x: e.clientX,
                    y: e.clientY,
                    content: toolTipDiv(d.listings, Math.round(d.Price),d.Title),
                });
            })
            .on("mouseout", () => setToolTip({ visible: false, x: toolTip.x, y: toolTip.y, content: "" }));
    }, [data, width, height, column, mode]);

    useEffect(() => {
        if (!toolTipRef.current) return;
        setToolTipSize({ width: toolTipRef.current.offsetWidth, height: toolTipRef.current.offsetHeight });
    }, [toolTipRef.current]);

    return (
        <>
            <div className="flex flex-col items-center">
                <div className="flex w-[600px]">
                    <div className="ml-auto">Mean Price by {column} for {city}</div>
                    <select
                        onChange={(e) => setColumn(e.target.value)}
                        value={column}
                        className="rounded-md p-1 bg-gray-400 ml-auto"
                    >
                        {columns.map((column) => (
                            <option key={column} value={column}>
                                {column}
                            </option>
                        ))}
                    </select>
                </div>
                <svg ref={svgRef} width={width} height={height} />
            </div>
            <AnimatePresence>
                {toolTip.visible && (
                    <motion.div
                        className="fixed bg-gray-200 p-2 rounded-md"
                        ref={toolTipRef}
                        style={{ top: toolTip.y - 60, left: toolTip.x - toolTipSize.width / 2, pointerEvents: "none" }}
                        entry={{ opacity: 1, y: -10 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        {toolTip.content}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

export default GraphLine;
