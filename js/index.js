const co = document.getElementById("cotext");
const temp = document.getElementById("temptext");
const coUpdate = document.getElementById("coupdate");
const tempUpdate = document.getElementById("tempupdate");
const coDanger = document.getElementById("codanger");
const tempDanger = document.getElementById("tempdanger");
const coTime = document.getElementById("cotime");
const tempTime = document.getElementById("temptime");
const notif_prompt = document.getElementById("notif_prompt");
var notifTime = Date.now();
var minsSinceLastCONotif = null;
var minsSinceLastTempNotif = null;
var coLineChart = null;
var coSubmit = document.getElementById('cosubmit');
var tempSubmit = document.getElementById('tempsubmit');

var adaUserCookie = Cookies.get('adauser');
var adaApiCookie = Cookies.get('adaapi');


// -- API KEYS, FIREBASE CONFIGS, AND ADAFRUIT IO FEED LINKS. CHANGE AS NEEDED --

window.onresize = function() {
    coLineChart.resize();
}

coSubmit.addEventListener("click", function() {
    const coStart = document.getElementById("costart").value;
    coChart(coStart, false);
    console.log(new Date(coStart).toISOString());
});
tempSubmit.addEventListener("click", function() {
    const tempStart = document.getElementById("tempstart").value;
    tempChart(tempStart, false);
    console.log(new Date(tempStart).toISOString());
});
tempLatest();
coLatest();
tempDangerLatest(true);
coDangerLatest(true);
coChart("2023-01-01", true);
tempChart("2023-01-01", true);

function tempLatest() {
    return new Promise(async function cb(resolve, reject) {
        // do async thing
        const res = await fetch('https://io.adafruit.com/api/v2/' + adaUserCookie + '/feeds/temp/data?limit=1', {
                headers: {
                    'X-AIO-Key': adaApiCookie
                }
            })
            .then(response => {
                if (response.ok) return response.json();
            })
            .then((text) => {
                if (text != null) {
                    //console.log((new Date(Date.parse(text[0].created_at)).toLocaleString()));
                    temp.innerHTML = (text[0]).value + " C";
                    tempUpdate.innerHTML = "Last updated: " + new Date(Date.parse(text[0].created_at)).toLocaleString("en-GB");
                }

            });
        // your custom code
        setTimeout(function() { cb(resolve, reject); }, 5000);
    })
}

function coLatest() {
    return new Promise(async function cb(resolve, reject) {
        // do async thing
        const res = await fetch('https://io.adafruit.com/api/v2/' + adaUserCookie + '/feeds/co/data?limit=1', {
                headers: {
                    'X-AIO-Key': adaApiCookie
                }
            })
            .then(response => {
                if (response.ok) return response.json();
                else console.log("error");
            })
            .then((text) => {
                if (text[0] != null) {
                    console.log(text[0]);
                    co.innerHTML = Math.round((text[0]).value * 1000) / 1000 + " ppm";
                    coUpdate.innerHTML = "Last updated: " + new Date(Date.parse(text[0].created_at)).toLocaleString("en-GB");
                } else {

                }

            });
        console.log('coLatest:')
        setTimeout(function() { cb(resolve, reject); }, 5000);
    })
}

function coChart(startDate, init) {
    return new Promise(async function cb(resolve, reject) {
        const startDateISO = new Date(startDate).toISOString();
        const endDateISO = new Date(moment(startDate).add(1, 'days')).toISOString();
        var link = 'https://io.adafruit.com/api/v2/' + adaUserCookie + '/feeds/co/data/chart?start_time=' + startDateISO + '&end_time=' + endDateISO + 'T23:59:59Z&resolution=10&field=avg';
        if (init == true) {
            console.log("inititng");
            link = 'https://io.adafruit.com/api/v2/' + adaUserCookie + '/feeds/co/data/chart?start_time=2023-01-01T00:00:00.000Z&end_time=2023-01-02T00:00:00.000ZT23:59:59Z&resolution=10&field=avg';
        }

        // do async thing
        const res = await fetch(link, {
                headers: {
                    'X-AIO-Key': adaApiCookie
                }
            })
            .then(response => {
                if (response.ok) return response.json();
                else console.log("error");
            })
            .then((text) => {
                if (text != null) {
                    console.log(text.data);
                    const data = convertToDataPoints(text.data);
                    var canvas = document.getElementById('cochart');
                    var ctx = canvas.getContext('2d');
                    if (init != true) {
                        coLineChart.destroy();
                    }
                    coLineChart = makeChart(ctx, data, "CO (ppm)");

                } else {
                    console.log("ouch");
                }

            });
        console.log('coChart:')
    })
}

function tempChart(startDate, init) {
    return new Promise(async function cb(resolve, reject) {
        const startDateISO = new Date(startDate).toISOString();
        const endDateISO = new Date(moment(startDate).add(1, 'days')).toISOString();
        var link = 'https://io.adafruit.com/api/v2/' + adaUserCookie + '/feeds/temp/data/chart?start_time=' + startDateISO + '&end_time=' + endDateISO + 'T23:59:59Z&resolution=10&field=avg';
        if (init == true) {
            console.log("inititng");
            link = 'https://io.adafruit.com/api/v2/' + adaUserCookie + '/feeds/temp/data/chart?start_time=2023-01-01T00:00:00.000Z&end_time=2023-01-02T00:00:00.000ZT23:59:59Z&resolution=10&field=avg';
        }

        // do async thing
        const res = await fetch(link, {
                headers: {
                    'X-AIO-Key': adaApiCookie
                }
            })
            .then(response => {
                if (response.ok) return response.json();
                else console.log("error");
            })
            .then((text) => {
                if (text != null) {
                    console.log(text.data);
                    const data = convertToDataPoints(text.data);
                    var canvas = document.getElementById('tempchart');
                    var ctx = canvas.getContext('2d');
                    if (init != true) {
                        tempLineChart.destroy();
                    }
                    tempLineChart = makeChart(ctx, data, "CO (ppm)");

                } else {
                    console.log("ouch");
                }

            });
        console.log('tempChart:')
    })
}

function convertToDataPoints(array) {
    console.log("here's my array");
    console.log(array);
    var dataPoints = [];
    for (let i = 0; i < array.length; i++) {
        const dictPoint = {
            x: (array[i])[0],
            y: (array[i])[1]
        }
        dataPoints.push(dictPoint);
    }
    return dataPoints;
}

function makeChart(ctx, data, label) {
    const config = {
        type: 'line',
        data: {
            datasets: [{
                data: data,
                label: label,
                borderColor: "#66bd63",
                fill: false
            }]
        },
        options: {
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: 'white',
                    },
                    grid: {
                        display: false
                    },
                    type: 'timeseries',
                },
                y: {
                    ticks: {
                        color: 'white',
                    },
                    grid: {
                        display: false
                    },
                }
            }
        }
    };
    return new Chart(ctx, config);
}