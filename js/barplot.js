
export function plotbar(commData, commName) {
    let backbtn = document.getElementById("backbar");
    backbtn.style.visibility = "visible";
    d3.selectAll("#lp > svg").remove(); 
    let marketNames = Array.from(new Set(commData.map(c => c["adm1_name"])));
    let plotData = [];
    for(let i=0;i<marketNames.length;i++) {
        let marketData = commData.filter(c => c["adm1_name"] == marketNames[i]);
        let plotObj = {};
        plotObj["mname"] = marketNames[i];
        plotObj["mp_price"] = d3.mean(marketData.map(m => parseFloat(m["mp_price"]))).toFixed(2);
        plotData.push(plotObj);
    }
    plotData.sort((b,a) => a["mp_price"] - b["mp_price"]);
    const margin = {top: 30, right: 30, bottom: 70, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    const svg = d3.select("#lp")
                    .append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const x = d3.scaleBand()
                .range([ 0, width ])
                .domain(plotData.map(d => d["mname"]))
                .padding(0.2);
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    const y = d3.scaleLinear()
                .domain([d3.min(plotData, d => parseFloat(d["mp_price"])), d3.max(plotData, d => parseFloat(d["mp_price"]))])
                .range([ height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    svg.selectAll("mybar")
        .data(plotData)
        .enter()
        .append("rect")
            .attr("x", d => x(d["mname"]))
            .attr("y", d => y(d["mp_price"]))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d["mp_price"]))
            .attr("fill", "#69b3a2")
}