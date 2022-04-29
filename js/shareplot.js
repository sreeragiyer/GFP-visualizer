let currPlotData = [];

export function plotsharepercent(sharedata) {
    let plotData = sharedata.map(d => ({"country" : d["Entity"], "val" : parseFloat(d["Percent"]).toFixed(2)}));
    plotData.sort((b,a) => a["val"] - b["val"]);
    plotData = plotData.slice(0,12);
    drawPlot(plotData);

}

function drawPlot(plotData) {
    currPlotData = $.extend(true, [], plotData);
    let margin = {top: 20, right: 30, bottom: 40, left: 200},
    width = 920 - margin.left - margin.right,
    height = 560 - margin.top - margin.bottom;

    let svg = d3.select("#healthydiet")
                .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let x = d3.scaleLinear()
                .domain([0, 100])
                .range([ 0, width]);

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

    let y = d3.scaleBand()
                .range([ 0, height ])
                .domain(plotData.map(d => d["country"]))
                .padding(0.4);

    svg.append("g")
        .call(d3.axisLeft(y))

    svg.selectAll("myRect")
        .data(plotData)
        .join("rect")
        .attr("x", x(0) )
        .attr("y", d => y(d["country"]))
        .attr("width", d => x(d["val"]))
        .attr("height", y.bandwidth())
        .attr("fill", "#69b3a2");

    svg.selectAll("text.myRect")
        .data(plotData)
        .enter().append("text")
            .attr("text-anchor", "middle")
            .style("font-size", "0.9em")
            .attr("x", function(d) {return x(d["val"])+25; })
            .attr("y", function(d) { return y(d["country"])+10; })
            .attr("dy", "0.5em")
            .text(function(d) { return d["val"]+"%"; });
}

export function addCountry(countryName, sharedata) {
    let errEl = document.getElementById("cerrormsg");
    errEl.style.visibility = "hidden";
    if(!countryName || countryName == "") return;
    countryName = countryName.trim().toLowerCase();
    if(currPlotData.find(d => d["country"].toLowerCase() == countryName)) return;
    let redData = sharedata.map(d => ({"country" : d["Entity"], "val" : parseFloat(d["Percent"]).toFixed(2)}));
    let countryObj = redData.find(d => d["country"].toLowerCase() == countryName);
    if(!countryObj) {
        errEl.style.visibility = "visible";
        return;
    }
    let plotData = $.extend(true, [], currPlotData);
    plotData.shift();
    plotData.push(countryObj);
    d3.selectAll("#healthydiet > svg").remove();
    drawPlot(plotData);
    document.getElementById("csearch").value = "";
}