async function getData() {
    try {
        let data = await d3.csv("https://raw.githubusercontent.com/sreeragiyer/GFP-visualizer/main/data/gfp_sampled.csv");
        return data;
    }
    catch(ex) {
        console.log("error while fetching data: "+ex);
        return null;
    }

}

getData().then((data) => {
    if(data==null) 
        return;
    // set the dimensions and margins of the graph
    const margin = { top: 5, right: 5, bottom: 5, left: 5 },
    width = document.querySelector("body").clientWidth,
    height = 500;

    const svg = d3.select("#d3_demo").attr("viewBox", [0, 0, width, height]);

    let projection = d3.geoEquirectangular().center([0, 0]);

    const pathGenerator = d3.geoPath().projection(projection);

    let g = svg.append("g");

    d3
    .json(
        "https://raw.githubusercontent.com/iamspruce/intro-d3/main/data/countries-110m.geojson"
    )
    .then((data) => {
        g.selectAll("path").data(data.features).join("path").attr("d", pathGenerator);
    });

});