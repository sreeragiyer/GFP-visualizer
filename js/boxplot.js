export function plotbox(gfpdata, countryName, year) {
    
    let backbtn = document.getElementById("backbar");
    backbtn.style.visibility = "visible";
    d3.selectAll("#lp > svg").remove(); 
    document.getElementById("linep").innerText = `Box Plot of food prices across months in ${countryName} for ${year}`;
    
    let countryData = gfpdata.filter(c => c["adm0_name"] == countryName)
    plotboxplotforcountry(countryData, year);
}

function plotboxplotforcountry(plotData, year) {

    var boxPlotData = []

    for(let i=1;i<=12;i++) {
        let marketData = plotData.filter(c => c["mp_month"] ==i && c["mp_year"]==year);
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

    Plotly.newPlot('box', boxPlotData, layout);

}