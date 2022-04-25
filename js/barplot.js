const selectedBarColor = "#00008B";
const defaultBarColor = "#69b3a2";
let commDataFull = [];
let selectedMkt = "";

export function plotbar(commData, commName) {
    let backbtn = document.getElementById("backbar");
    backbtn.style.visibility = "visible";
    document.getElementById("zoombtn").style.display = "block";
    d3.selectAll("#lp > svg").remove(); 
    commDataFull = $.extend(true, [], commData); 
    let countryName = commData[0]["adm0_name"];
    document.getElementById("linep").innerText = `Comparison of ${commName} prices across markets in ${countryName}`;
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
    const margin = {top: 15, right: 15, bottom: 50, left: 60},
    width = 840 - margin.left - margin.right,
    height = 180 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    const svg = d3.select("#lp")
                    .append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .attr("id", "bpsvg")
                    .append("g")
                        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const x = d3.scaleBand()
                .range([ 0, width ])
                .domain(plotData.map(d => d["mname"]))
                .padding(0.4);
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
            .attr("fill", defaultBarColor)
            .on("mouseover", function(d,i) {
                    let textEl = document.getElementById(i["mname"].replace(/\s+/g, '-')+"-text");
                    textEl.style.display = null;
                    d.target.style.cursor = "pointer";
                })
            .on("mouseout", function(d,i) { 
                    let textEl = document.getElementById(i["mname"].replace(/\s+/g, '-')+"-text");
                    textEl.style.display = "none";
                    d.target.style.cursor = null;
                })
            .on("click", (d,i) => {
                filterByMarket(commData, commName, i["mname"], d);
            });

    svg.selectAll("text.mybar")
        .data(plotData)
        .enter().append("text")
            .attr("text-anchor", "middle")
            .attr("id", (d) => d["mname"].replace(/\s+/g, '-')+"-text")
            .style("font-size", "0.9em")
            .style("display", "none")
            .attr("x", function(d) {return x(d["mname"]); })
            .attr("y", function(d) { return y(d["mp_price"]) - 5; })
            .text(function(d) { return d["mp_price"]; });
}

export function plotLineBelowBar(commData, commName) {
    let margin = {top: 10, right: 15, bottom: 30, left: 60};
    let width = 840 - margin.left - margin.right;
    let height = 240 - margin.top - margin.bottom;
    let x = d3.scaleTime()
                .domain(d3.extent(commData, d => d["date"]))
                .range([ 0, width ]);
    let y = d3.scaleLinear()
                .domain([d3.min(commData, d => parseFloat(d["mp_price"])), d3.max(commData, d => parseFloat(d["mp_price"]))])
                .range([ height, 0 ]);
    let svg = d3.select("#lp")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .attr("id", "linebelowbar")
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    let dgrp = []
    for(let i=2019;i<2022;i++) {
        for(let j=1;j<=12;j++) {
            let g = commData.filter(c => c["mp_year"]==i && c["mp_month"] == j);
            if(g.length>0) {
                dgrp.push(g);
            }
        }
    }
    let commDataAvg = dgrp.map(g => ({"date": g[0]["date"], "mp_price": g.map(c => parseFloat(c["mp_price"])).reduce((a,b) => a+b,0).toFixed(2)/g.length}));
    let xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat("%m/%y"));
    let xAxisCall = svg.append("g")
                        .attr("transform", "translate(0," + height + ")")
                        .call(xAxis);
    svg.append("g")
        .call(d3.axisLeft(y));

    let clip = svg.append("defs").append("svg:clipPath")
                    .attr("id", "clip")
                    .append("svg:rect")
                    .attr("width", width )
                    .attr("height", height )
                    .attr("x", 0)
                    .attr("y", 0);

    let idleTimeout;
    function idled() { idleTimeout = null; }

    const updateChart = (d) => {
        let extent = d.selection;

        // If no selection, back to initial coordinate. Otherwise, update X axis domain
        if(!extent){
            if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
            x.domain([ 4,8]);
        }
        else{
            x.domain([ x.invert(extent[0]), x.invert(extent[1]) ]);
            redrawBarPlot(commDataFull, [ x.invert(extent[0]), x.invert(extent[1]) ], commName);
            svg.select(".brush").call(brush.move, null); // This remove the grey brush area as soon as the selection has been done
        }

        // Update axis and line position
        xAxisCall.transition().duration(1000).call(d3.axisBottom(x).tickFormat(d3.timeFormat("%m/%y")));
        svg.select('.line')
            .transition()
            .duration(1000)
            .attr("d", d3.line()
                .x(function(d) { return x(d["date"]) })
                .y(function(d) { return y(d["mp_price"]) })
        );
    };
          
    
    let brush = d3.brushX()                  
                    .extent( [ [0,0], [width,height] ] )  
                    .on("end", updateChart);
              
    svg.append('g')
        .attr("clip-path", "url(#clip)");

    svg.append("g")
        .attr("class", "brush")
        .call(brush);
    
    svg.on("dblclick", function() {
        x.domain(d3.extent(commDataAvg, function(d) { return d["date"]; }));
        redrawBarPlot(commDataFull, d3.extent(commDataAvg, function(d) { return d["date"]; }), commName);
        xAxisCall.transition().call(d3.axisBottom(x).tickFormat(d3.timeFormat("%m/%y")));
        svg.select('.line')
            .transition()
            .attr("d", d3.line()
                .x(function(d) { return x(d["date"]) })
                .y(function(d) { return y(d["mp_price"]) })
            );
    });

    svg.append("path")
        .datum(commDataAvg)
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
          .x(function(d) { return x(d["date"]) })
          .y(function(d) { return y(d["mp_price"]) })
        );

    let focus = svg.append("g")
                    .attr("class", "focus")
                    .style("display", "none");

    focus.append("circle")
            .attr("r", 5);

    focus.append("rect")
            .attr("class", "tooltip-lp")
            .attr("width", 180)
            .attr("height", 50)
            .attr("x", 10)
            .attr("y", -22)
            .attr("rx", 4)
            .attr("ry", 4);

    focus.append("text")
            .attr("class", "tooltip-date")
            .attr("x", 18)
            .attr("y", -2);

    focus.append("text")
            .attr("x", 18)
            .attr("y", 18)
            .text("Price: ");

    focus.append("text")
            .attr("class", "tooltip-likes")
            .attr("x", 60)
            .attr("y", 18);

    let bisectDate = d3.bisector(function(d) { return d["date"]; }).left;
    let dateFormatter = d3.timeFormat("%m/%y");
    function mousemove(e) {
        let x0 = x.invert(d3.pointer(e)[0]);
        let i = bisectDate(commDataAvg, x0, 1);
        let d0 = commDataAvg[i - 1];
        let d1 = commDataAvg[i];
        let d = x0 - d0.date > d1.date - x0 ? d1 : d0;
        focus.attr("transform", "translate(" + x(d["date"]) + "," + y(d["mp_price"]) + ")");
        focus.select(".tooltip-date").text(dateFormatter(d["date"]));
        focus.select(".tooltip-likes").text(parseFloat(d["mp_price"]).toFixed(2)+" (local curr.)");
    }

    svg.append("rect")
        .attr("class", "overlay")
        .attr("id", "overlayrect")
        .attr("width", width)
        .attr("height", height)
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); })
        .on("mousemove", mousemove);

}

function redrawBarPlot(commDataOg, dates, commName) {
    d3.selectAll("#bpsvg > *").remove();
    let stdate = new Date(dates[0]);
    let endate = new Date(dates[1]);
    let commData = $.extend(true, [], commDataOg); 
    commData = commData.filter(m => (new Date(m["date"])) >= stdate && (new Date(m["date"])) <= endate );
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
    const margin = {top: 15, right: 15, bottom: 50, left: 60},
    width = 840 - margin.left - margin.right,
    height = 180 - margin.top - margin.bottom;
    const x = d3.scaleBand()
                .range([ 0, width ])
                .domain(plotData.map(d => d["mname"]))
                .padding(0.4);
    const y = d3.scaleLinear()
                .domain([d3.min(plotData, d => parseFloat(d["mp_price"])), d3.max(plotData, d => parseFloat(d["mp_price"]))])
                .range([ height, 0]);

    let svg = d3.select("#bpsvg")
                .append("g")
                .attr("transform", `translate(${margin.left}, ${margin.top})`);

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

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
            .attr("fill", (d) => d["mname"] == selectedMkt ? selectedBarColor : defaultBarColor)
            .on("mouseover", function(d,i) {
                let textEl = document.getElementById(i["mname"].replace(/\s+/g, '-')+"-text");
                textEl.style.display = null;
                d.target.style.cursor = "pointer";
            })
            .on("mouseout", function(d,i) { 
                let textEl = document.getElementById(i["mname"].replace(/\s+/g, '-')+"-text");
                textEl.style.display = "none";
                d.target.style.cursor = null;
            })
            .on("click", (d,i) => {
                filterByMarket(commData, commName, i["mname"], d);
            });

    svg.selectAll("text.mybar")
    .data(plotData)
    .enter().append("text")
        .attr("text-anchor", "middle")
        .attr("id", (d) => d["mname"].replace(/\s+/g, '-')+"-text")
        .style("font-size", "0.9em")
        .style("display", "none")
        .attr("x", function(d) {return x(d["mname"]); })
        .attr("y", function(d) { return y(d["mp_price"]) - 5; })
        .text(function(d) { return d["mp_price"]; });

}

function filterByMarket(commData, commName, mktName, event) {
    d3.select("#linebelowbar").remove();
    if(event.target.getAttribute("fill") == selectedBarColor) {
        event.target.setAttribute("fill", defaultBarColor);
        selectedMkt = "";
        plotLineBelowBar(commDataFull, commName);
    }
    else {
        d3.selectAll("rect").attr("fill", defaultBarColor);
        event.target.setAttribute("fill", selectedBarColor);
        selectedMkt = mktName;
        let filteredCommData = $.extend(true, [], commDataFull); 
        filteredCommData = filteredCommData.filter(c => c["adm1_name"] == mktName);
        plotLineBelowBar(filteredCommData, commName);
    }
} 