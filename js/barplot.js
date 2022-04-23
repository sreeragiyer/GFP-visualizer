const selectedBarColor = "#00008B";
const defaultBarColor = "#69b3a2";

export function plotbar(commData, commName) {
    let backbtn = document.getElementById("backbar");
    backbtn.style.visibility = "visible";
    d3.selectAll("#lp > svg").remove(); 
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
    const margin = {top: 15, right: 15, bottom: 50, left: 30},
    width = 840 - margin.left - margin.right,
    height = 180 - margin.top - margin.bottom;

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
            .on("click", (d,i) => {
                filterByMarket(commData, commName, i["mname"], d);
            });
}

export function plotLineBelowBar(commData, commName) {
    let margin = {top: 10, right: 15, bottom: 30, left: 30};
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
            x.domain([ 4,8])
        }
        else{
            x.domain([ x.invert(extent[0]), x.invert(extent[1]) ])
            svg.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
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
        .attr("clip-path", "url(#clip)")

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

        
    svg.append("g")
        .attr("class", "brush")
        .call(brush);
    
    svg.on("dblclick",function() {
        x.domain(d3.extent(commDataAvg, function(d) { return d["date"]; }));
        xAxisCall.transition().call(d3.axisBottom(x).tickFormat(d3.timeFormat("%m/%y")));
        svg.select('.line')
            .transition()
            .attr("d", d3.line()
                .x(function(d) { return x(d["date"]) })
                .y(function(d) { return y(d["mp_price"]) })
            );
    });

}

function filterByMarket(commData, commName, mktName, event) {
    d3.select("#linebelowbar").remove();
    if(event.target.getAttribute("fill") == selectedBarColor) {
        event.target.setAttribute("fill", defaultBarColor);
        plotLineBelowBar(commData, commName);
    }
    else {
        d3.selectAll("rect").attr("fill", defaultBarColor);
        event.target.setAttribute("fill", selectedBarColor);
        let filteredCommData = $.extend(true, [], commData); 
        filteredCommData = filteredCommData.filter(c => c["adm1_name"] == mktName);
        plotLineBelowBar(filteredCommData, commName);
    }
} 