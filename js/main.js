"use strict";
var notifTime = Date.now();
var minsSinceLastCONotif = null;
var minsSinceLastTempNotif = null;
navigator.serviceWorker.register('/firebase-messaging-sw.js');
var hamburgerMenu = document.getElementById('hamburger_menu');
var menuElements = document.getElementById('desktop_nav_container');
hamburgerMenu.addEventListener("click", function() {
    if (menuElements.style.display === "block") {
        menuElements.style.display = "none";
    } else {
        menuElements.style.display = "block";
    }
});
refreshCookies();
window.onresize = function() {
    /* this ensures that the menu stays visible in desktop mode, if the dropdown menu 
    wasn't opened and when the user goes from mobile to desktop (e.g. tablets changing
    orientation)
    */
    if ((menuElements.style.display === "none" && window.innerWidth > 800) || (menuElements.style.display === "block" && window.innerWidth <= 800)) {
        if (menuElements.style.display === "block") {
            menuElements.style.display = "none";
        } else {
            menuElements.style.display = "block";
        }
    }
}
notif_prompt.addEventListener("click", function() {

    Notification.requestPermission()
        .then(function(permission) {
            console.log('permiss', permission)
            if (permission === "granted") {
                notif_prompt.remove();
                location.reload();
            }
        });
});

if (Notification.permission === "granted") {
    notif_prompt.remove();
}

// -- API KEYS, FIREBASE CONFIGS, AND ADAFRUIT IO FEED LINKS. CHANGE AS NEEDED --
var adaUserCookie = Cookies.get('adauser');
var adaApiCookie = Cookies.get('adaapi');
var fbApiCookie = Cookies.get('fbapi');
var fbAuthCookie = Cookies.get('fbauth');
var fbProjectCookie = Cookies.get('fbproject');
var fbStorageCookie = Cookies.get('fbstorage');
var fbSenderCookie = Cookies.get('fbsender');
var fbAppCookie = Cookies.get('fbapp');
var fbMeasurementCookie = Cookies.get('fbmeasurement');
var fbTokenCookie = Cookies.get('fbtoken');
/*
Based on https://firebase.google.com/docs/cloud-messaging/js/receive#web-version-8_1
*/
firebase.initializeApp({
    apiKey: fbApiCookie,
    authDomain: fbAuthCookie,
    projectId: fbProjectCookie,
    storageBucket: fbStorageCookie,
    messagingSenderId: fbSenderCookie,
    appId: fbAppCookie,
    measurementId: fbMeasurementCookie
});
const messaging = firebase.messaging();
messaging
    .requestPermission()
    .then(() => {
        return messaging.getToken();
    })
    .then(token => {
        console.log("here's my token");
        Cookies.set('fbtoken', token, { expires: 365 });
        console.log(token);
    })
    .catch(err => {
        console.log(err);
    });
/*
messaging.onMessage(payload => {
    console.log("Message received. ", payload);
    const { title, ...options } = payload.notification;
});
*/





function coDangerLatest(isIndex) {
    return new Promise(async function cb(resolve, reject) {
        // do async thing
        const res = await fetch('https://io.adafruit.com/api/v2/' + adaUserCookie + '/feeds/codanger/data?limit=1', {
                headers: {
                    'X-AIO-Key': adaApiCookie
                }
            })
            .then(response => {
                if (response.ok) return response.json();
                else console.log(response.json());
            })
            .then((text) => {
                if (text[0] != null) {
                    var lastUpdated = new Date(Date.parse(text[0].created_at)).toLocaleString("en-GB");
                    var lastUpdatedUnix = Date.parse(text[0].created_at);
                    var currDate = new Date();
                    var minutesDiff = minDiff(lastUpdatedUnix, currDate);
                    if (isIndex) {
                        coTime.innerHTML = lastUpdated;
                        coDanger.innerHTML = text[0].value + " ppm";
                    }
                    if (minsSinceLastTempNotif != null) {
                        minsSinceLastCONotif = minDiff(notifTime, currDate);
                    }
                    console.log(minutesDiff);
                    console.log(minsSinceLastCONotif);
                    if (minutesDiff <= 20 && (minsSinceLastCONotif == null || minsSinceLastCONotif >= 10) && text[0].value >= 70) {
                        minsSinceLastCONotif = minDiff(notifTime, currDate);
                        notifTime = Date.now();
                        notify("CO levels are high!", text[0].value + " ppm. ");

                    }



                }
            });
        console.log('coDangerLatest:');
        setTimeout(function() { cb(resolve, reject); }, 5000);
    })
}

function tempDangerLatest(isIndex) {
    return new Promise(async function cb(resolve, reject) {
        // do async thing
        const res = await fetch('https://io.adafruit.com/api/v2/' + adaUserCookie + '/feeds/tempdanger/data?limit=1', {
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
                    var lastUpdated = new Date(Date.parse(text[0].created_at)).toLocaleString("en-GB");
                    var lastUpdatedUnix = Date.parse(text[0].created_at);
                    var currDate = new Date();
                    var minutesDiff = minDiff(lastUpdatedUnix, currDate);
                    if (isIndex) {
                        tempTime.innerHTML = lastUpdated;
                        tempDanger.innerHTML = text[0].value + " C";
                    }

                    if (minsSinceLastTempNotif != null) {
                        minsSinceLastTempNotif = minDiff(notifTime, currDate);
                    }
                    console.log(minutesDiff);
                    console.log(minsSinceLastTempNotif);
                    if (minutesDiff <= 20 && (minsSinceLastTempNotif == null || minsSinceLastTempNotif >= 10) && text[0].value >= 35) {
                        minsSinceLastTempNotif = minDiff(notifTime, currDate);
                        notifTime = Date.now();
                        notify("Temperature levels are high!", text[0].value + " C. ");

                    }



                }

            });
        console.log('tempDangerLatest:')
        setTimeout(function() { cb(resolve, reject); }, 5000);
    })
}

function minDiff(date1, date2) {
    var diff = Math.abs(date1 - date2);
    return diff / 1000 / 60;
}

function notify(title, body) {
    const options = {
        body: body,
    };
    return new Notification(title, options);
}

function refreshCookies() {
    if (adaUserCookie !== undefined) {
        Cookies.set('adauser', adaUserCookie, { expires: 365 })
    }
    if (adaApiCookie !== undefined) {
        Cookies.set('adaapi', adaApiCookie, { expires: 365 })
    }
    if (fbApiCookie !== undefined) {
        Cookies.set('fbapi', fbApiCookie, { expires: 365 })
    }
    if (fbAuthCookie !== undefined) {
        Cookies.set('fbauth', fbAuthCookie, { expires: 365 })
    }
    if (fbProjectCookie !== undefined) {
        Cookies.set('fbproject', fbProjectCookie, { expires: 365 })
    }
    if (fbStorageCookie !== undefined) {
        Cookies.set('fbstorage', fbStorageCookie, { expires: 365 })
    }
    if (fbSenderCookie !== undefined) {
        Cookies.set('fbsender', fbSenderCookie, { expires: 365 })
    }
    if (fbAppCookie !== undefined) {
        Cookies.set('fbapp', fbAppCookie, { expires: 365 })
    }
    if (fbMeasurementCookie !== undefined) {
        Cookies.set('fbmeasurement', fbMeasurementCookie, { expires: 365 })
    }
    if (fbTokenCookie !== undefined) {
        Cookies.set('fbtoken', fbTokenCookie, { expires: 365 })
    }
}