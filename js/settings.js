"use strict";

var adaUser = document.getElementById('adauser');
var adaApi = document.getElementById('adaapi');
var fbApi = document.getElementById('fbapi');
var fbAuth = document.getElementById('fbauth');
var fbProject = document.getElementById('fbproject');
var fbStorage = document.getElementById('fbstorage');
var fbSender = document.getElementById('fbsender');
var fbApp = document.getElementById('fbapp');
var fbMeasurement = document.getElementById('fbmeasurement');
var fbToken = document.getElementById('fbtoken');
var optionSubmit = document.getElementById('option_submit');
var optionUpdate = document.getElementById('option_update');

if (adaUserCookie !== undefined && adaApiCookie !== undefined) {
    coDangerLatest(false);
    tempDangerLatest(false);
}

var valueArray = ['adauser', 'adaapi', 'fbapi', 'fbauth', 'fbproject', 'fbstorage', 'fbsender', 'fbapp', 'fbmeasurement', 'fbtoken'];

optionSubmit.addEventListener("click", function() {
    var valueArrayNoToken = valueArray.slice(0, valueArray.length - 1);
    for (var i = 0; i < valueArrayNoToken.length; i++) {
        if (document.getElementById(valueArrayNoToken[i]).value !== "") {
            Cookies.set(valueArrayNoToken[i], document.getElementById(valueArrayNoToken[i]).value, { expires: 365 });
        }
    }
});
if (fbTokenCookie !== undefined && adaUserCookie !== undefined && adaApiCookie !== undefined) {
    optionUpdate.addEventListener("click", function() {
        const form = new FormData();
        form.append('value', fbTokenCookie);
        fetch('https://io.adafruit.com/api/v2/' + adaUserCookie + '/feeds/tokens/data', {
                method: 'POST',
                headers: {
                    'X-AIO-Key': adaApiCookie
                },
                body: form
            })
            .then(response => response.json())
            .then(response => console.log(JSON.stringify(response)))
    });
} else {
    optionUpdate.remove();
}

for (var i = 0; i < valueArray.length; i++) {
    if (Cookies.get(valueArray[i]) !== undefined) {
        document.getElementById(valueArray[i]).value = Cookies.get(valueArray[i]);
    }
}