export function plotbox(gfpdata, countryName) {
    
    let backbtn = document.getElementById("backbar");
    backbtn.style.visibility = "visible";
    d3.selectAll("#lp > svg").remove(); 
    document.getElementById("linep").innerText = `Box Plot of food prices across months in ${countryName}`;
    
    let countryData = gfpdata.filter(c => c["adm0_name"] == countryName)
    
    let plotData = [];
    for(let i=1;i<=12;i++) {
        let marketData = countryData.filter(c => c["mp_month"] ==i);
        if (marketData.length>0) {
	        let plotObj = {};
	        plotObj["month"] = i;
	        plotObj["mp_price"] =  marketData.map(m => parseFloat(m["mp_price"]).toFixed(2));//d3.mean(marketData.map(m => parseFloat(m["mp_price"]))).toFixed(2);
	        plotData.push(plotObj);
    	}
    }

    plotboxplotforcountry(countryData);
}

function plotboxplotforcountry(plotData) {

	var boxPlotData = []

    for(let i=1;i<=12;i++) {
        let marketData = plotData.filter(c => c["mp_month"] ==i);
        if (marketData.length>0) {
	        let plotObj = {};
	        plotObj["name"] = i;
	        plotObj["type"] = "box";
	        plotObj["y"] = marketData.map(m => parseFloat(m["mp_price"]).toFixed(2));
	        boxPlotData.push(plotObj);
    	}
    }
	
	var layout = {
	  title: 'Box Plot'
	};

	Plotly.newPlot('lp', boxPlotData, layout);

}