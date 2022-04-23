import {plotbar, plotLineBelowBar} from './barplot.js'

export function plotline(gfpdata, countryName) {
    let countryData = gfpdata.filter(c => c["adm0_name"] == countryName)
    countryData = countryData.map(countryObj => ({...countryObj, "date": d3.timeParse("%Y-%m")(countryObj["mp_year"]+"-"+countryObj["mp_month"])}));
    let commNames =  Array.from(new Set(countryData.map(c => c["cm_name"])));
    document.getElementById("linep").innerText = `Food prices trends in ${countryName}`;
    for(let i=0;i<commNames.length;i++) {
        let commData = countryData.filter(c => c["cm_name"] == commNames[i]);
        plotLineForCommodity(commData, commNames[i]);
    }
}

function plotLineForCommodity(commData, commName) {
    let margin = {top: 10, right: 30, bottom: 30, left: 60};
    let width = 460 - margin.left - margin.right;
    let height = 400 - margin.top - margin.bottom;
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
                .on("click", () => {
                    plotbar(commData, commName);
                    plotLineBelowBar(commData, commName);
                })
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
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
    svg.append("g")
        .call(d3.axisLeft(y));
    svg.append("text")
        .attr("x", (width / 2))             
        .attr("y", 0 - (margin.top / 8))
        .attr("text-anchor", "middle")  
        .style("font-size", "12px") 
        .text(commName);
    svg.append("path")
        .datum(commDataAvg)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
          .x(function(d) { return x(d["date"]) })
          .y(function(d) { return y(d["mp_price"]) })
        );

}