console.log("data log")
//https://www.dropbox.com/scl/fo/mxrg82kxwgw3vrges58l0/h?dl=0&rlkey=u8y2qvtjc2m4p00a5aaiohsiz
let data = null
d3.csv("https://www.dropbox.com/s/voljxe8cfc061a1/global_food_prices.csv?dl=0").then((d) => {
        data = d;
        console.log("in");
        console.log(data)
    }
)
console.log(data);