export function plotcommoditybar(gfpdata) {

    let commNames =  Array.from(new Set(gfpdata.map(c => c["cm_name"])));

    let commData = []
    for(let i=0;i<commNames.length;i++) {
        let currCommData = gfpdata.filter(c => c["cm_name"] == commNames[i]);
        let plotObj = {};
        plotObj["commodity_name"] = commNames[i];
        plotObj["commodity_count"] = currCommData.length;
        commData.push(plotObj)
    }
	
	commData.sort(function(b, a) {
	    return a["commodity_count"] - b["commodity_count"];
	 });
    
    let topCommodityData = commData.slice(0,20)
	// set the dimensions and margins of the graph
	const margin = {top: 30, right: 30, bottom: 120, left: 60},
	    width = 840 - margin.left - margin.right,
	    height = 580 - margin.top - margin.bottom;

	// append the svg object to the body of the page
	const svg = d3.select("#global_commodity_svg")
	  .append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform", `translate(${margin.left}, ${margin.top})`);


    // X axis
	  const x = d3.scaleBand()
	    .range([ 0, width ])
	    .domain(topCommodityData.map(d => d.commodity_name))
	    .padding(0.2);
	  svg.append("g")
	    .attr("transform", `translate(0, ${height})`)
	    .call(d3.axisBottom(x))
	    .selectAll("text")
	      .attr("transform", "translate(-10,0)rotate(-45)")
	      .style("text-anchor", "end");

	  // Add Y axis
	  const y = d3.scaleLinear()
	    .domain(d3.extent(topCommodityData, d => d["commodity_count"]))
	    .range([ height, 0]);
	  svg.append("g")
	    .call(d3.axisLeft(y));

	  // Bars
	  svg.selectAll("mybar")
	    .data(topCommodityData)
	    .enter()
	    .append("rect")
	      .attr("x", d => x(d.commodity_name))
	      .attr("y", d => y(d.commodity_count))
	      .attr("width", x.bandwidth())
	      .attr("height", d => height - y(d.commodity_count))
	      .attr("fill", "#69b3a2")

}


export function plotfoodtypescountbar(gfpdata) {
	let countryNames =  Array.from(new Set(gfpdata.map(c => c["adm0_name"])));
	let countryData = []
    for(let i=0;i<countryNames.length;i++) {
        let currCountryData = gfpdata.filter(c => c["adm0_name"] == countryNames[i]);
        let commNames =  Array.from(new Set(currCountryData.map(c => c["cm_name"])));
        let plotObj = {};
        plotObj["country_name"] = countryNames[i];
        plotObj["num_product_types"] = commNames.length;
        countryData.push(plotObj)
    }
	countryData.sort(function(b, a) {
	    return a["num_product_types"] - b["num_product_types"];
	 });
    let topCountryData = countryData.slice(0,20)
	// set the dimensions and margins of the graph
	const margin = {top: 30, right: 30, bottom: 120, left: 60},
	    width = 840 - margin.left - margin.right,
	    height = 580 - margin.top - margin.bottom;

	// append the svg object to the body of the page
	const svg = d3.select("#country_product_count")
	  .append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform", `translate(${margin.left}, ${margin.top})`);


    // X axis
	  const x = d3.scaleBand()
	    .range([ 0, width ])
	    .domain(topCountryData.map(d => d.country_name))
	    .padding(0.2);
	  svg.append("g")
	    .attr("transform", `translate(0, ${height})`)
	    .call(d3.axisBottom(x))
	    .selectAll("text")
	      .attr("transform", "translate(-10,0)rotate(-45)")
	      .style("text-anchor", "end");

	  // Add Y axis
	  const y = d3.scaleLinear()
	    .domain(d3.extent(topCountryData, d => d["num_product_types"]))
	    .range([ height, 0]);
	  svg.append("g")
	    .call(d3.axisLeft(y));

	  // Bars
	  svg.selectAll("mybar")
	    .data(topCountryData)
	    .enter()
	    .append("rect")
	      .attr("x", d => x(d.country_name))
	      .attr("y", d => y(d.num_product_types))
	      .attr("width", x.bandwidth())
	      .attr("height", d => height - y(d.num_product_types))
	      .attr("fill", "#69b3a2")

}