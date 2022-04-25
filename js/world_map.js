import {plotline} from './lineplot.js';
import {plotcommoditybar, plotfoodtypescountbar} from './commoditybarplot.js';
import {plotsharepercent, addCountry} from './shareplot.js';
import {plotbox} from './boxplot.js';

let popout = document.getElementById("lptotal");
let closebtn = document.getElementById("popoutclose");
let barbackbtn = document.getElementById("backbar");
let zoombtn =  document.getElementById("zoombtn");
let searchbtn = document.getElementById("searchbtn");
let searchbar = document.getElementById("csearch");
let boxplotbtn = document.getElementById("boxbtn");

let clickedCountry = "";
let gfpdata = [];
let pricedata = [];
let sharedata = [];

async function getData() {
    try {
        let gfpPromise = d3.csv("https://raw.githubusercontent.com/sreeragiyer/GFP-visualizer/main/data/gfp_sampled.csv");
        let pricePromise = d3.csv("https://raw.githubusercontent.com/sreeragiyer/GFP-visualizer/main/data/food-prices.csv");
        let sharePromise = d3.csv("https://raw.githubusercontent.com/sreeragiyer/GFP-visualizer/main/data/share-healthy-diet-unaffordable.csv");
        const data_2 = await Promise.all([gfpPromise, pricePromise, sharePromise]);
        let [gfpdata, pricedata, sharedata] = data_2;
        return [gfpdata, pricedata, sharedata];
    }
    catch(ex) {
        console.log("error while fetching data: "+ex);
        return null;
    }

}


function ready(error, data, gfpdata, pricedata) {
    if (error) throw error;
    let [world, names] = data
    let uniqueCountryNames =  Array.from(new Set(gfpdata.map(c => c["adm0_name"])));
    let margin = {top: 10, right: 10, bottom: 10, left: 10};
    let width = 960 - margin.left - margin.right;
    let height = 520 - margin.top - margin.bottom;
    let projection = d3.geoNaturalEarth1()
                    .center([-50, 15]) 
                    .rotate([-9,0])
                    .scale([1300/(2*Math.PI)]) 
                    .translate([450,300]);
    let path = d3.geoPath()
                .projection(projection);
    let svg = d3.select("svg")
                .append("g")
                .attr("width", width)
                .attr("height", height);
    let tooltip = d3.select("div.tooltip");
    let countries1 = topojson.feature(world, world.objects.countries).features;
    let countries = countries1.filter(function(d) {
        return names.some(function(n) {
        if (d.id == n.id) return d.name = n.name;
        })});
    svg.selectAll("path")
                .data(countries)
                .enter()
                .append("path")
                .attr("stroke","green")
                .attr("stroke-width",1)
                .attr("fill", "white")
                .attr("d", path )
                .on("mouseover",function(d,i){
                    let currCountry = uniqueCountryNames.find(c => c == i.name);
                    if(currCountry) {
                        d3.select(this).style("cursor", "pointer");
                        d3.select(this).attr("fill","grey").attr("stroke-width",2);
                    }
                    return tooltip.style("hidden", false).html(i.name);
                })
                .on("mousemove",function(d,i){
                    let countryObj = pricedata.find(c => c["Entity"] == i.name);
                    let healthCost = countryObj && countryObj["Cost of healthy diet (2017 USD per day)"] ? parseFloat(countryObj["Cost of healthy diet (2017 USD per day)"]).toFixed(2) : "";
                    let healthHtml = healthCost!="" ? i.name + "<br>$" + healthCost + "/day" : i.name; 
                    tooltip.classed("hidden", false)
                        .style("top", (d.pageY) + "px")
                        .style("left", (d.pageX + 10) + "px")
                        .html(healthHtml);
                })
                .on("mouseout",function(d,i){
                    d3.select(this).style("cursor", null);
                    d3.select(this).attr("fill","white").attr("stroke-width",1);
                    tooltip.classed("hidden", true);
                })
                .on("click", function(d,i) {
                    popout.style = "display:flex";
                    clickedCountry = i.name;
                    plotline(gfpdata, i.name)
                });
    plotcommoditybar(gfpdata);
    document.getElementById("global_commodity_svg").style.display = "none";
    plotfoodtypescountbar(gfpdata);
}

async function getMapData() {
    try {
        let jsondata = await d3.json("https://gist.githubusercontent.com/abrahamdu/50147e692857054c2bf88c443946e8a5/raw/66d5543cce335f4360881dae87d96726e931e4d4/world-110m.json");
        let csvdata = await d3.csv("https://gist.githubusercontent.com/abrahamdu/50147e692857054c2bf88c443946e8a5/raw/66d5543cce335f4360881dae87d96726e931e4d4/world-country-names.csv");
        return [jsondata, csvdata];
    }
    catch(ex) {
        console.log("could not fetch map data "+ex);
        return null;
    }
}

getData().then((data) => {
    if(data==null) 
        return;
    [gfpdata, pricedata, sharedata] = data;

    getMapData().then((data) => {
        if(data==null)
            return;

        ready(null, data, gfpdata, pricedata);

    });
    plotsharepercent(sharedata);

});

closebtn.addEventListener("click", (e) => {
    d3.selectAll("#lp > svg").remove(); 
    $('#lp').empty();
    barbackbtn.style.visibility = "hidden";
    boxplotbtn.style.visibility = "visible";
    popout.style = "display:none";
    zoombtn.style.display = "none";
});

boxplotbtn.addEventListener("click", (e) => {
    d3.selectAll("#lp > svg").remove(); 
    $('#lp').empty();
    plotbox(gfpdata, clickedCountry);
    boxplotbtn.style.visibility = "hidden";
});


barbackbtn.addEventListener("click", (e) => {
    d3.selectAll("#lp > svg").remove(); 
    zoombtn.style.display = "none";
    $('#lp').empty();
    plotline(gfpdata, clickedCountry);
    barbackbtn.style.visibility = "hidden";
    boxplotbtn.style.visibility = "visible";
});

zoombtn.addEventListener("click", (e) => {
    let overlayrect = document.getElementById("overlayrect");
    if(overlayrect && overlayrect.style.display == "none")
        overlayrect.style = "display:block";
    else if(overlayrect)
        overlayrect.style = "display:none";
});

searchbtn.addEventListener("click", (e) => {
    let textEl = document.getElementById("csearch");
    addCountry(textEl.value, sharedata);
});

searchbar.addEventListener("keypress", (e) => {
    if(e.key == "Enter") {
        addCountry(e.target.value, sharedata);
    }
});

$(function() {
    $("#global_stastics").change(function() {
        let selected_val = $('option:selected', this).text();
        console.log(selected_val);
        if (selected_val=="Top Food Product Types") {
            //$('#country_product_count').hide(); // $('#country_product_count').empty();
            document.getElementById("country_product_count").style.display = "none";
            document.getElementById("global_commodity_svg").style.display = "block";
            //$('#global_commodity_svg').style.visibility = "visible";    //plotcommoditybar(gfpdata);
        } else if(selected_val=="Top Countries With Most Food Product Types") {
            document.getElementById("country_product_count").style.display = "block";
            document.getElementById("global_commodity_svg").style.display = "none";
            //$('#country_product_count').style.visibility = "visible";  //plotfoodtypescountbar(gfpdata);
        }
    });
});

document.addEventListener("keypress", (e) => {
    if(e.key == "q") {
        let overlayrect = document.getElementById("overlayrect");
        if(overlayrect && overlayrect.style.display == "none")
            overlayrect.style = "display:block";
        else if(overlayrect)
            overlayrect.style = "display:none";
    }
});

