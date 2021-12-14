/*
|--------------------------------------------------------------------------
| api.js -- server routes
|--------------------------------------------------------------------------
|
| This file defines the routes for your server.
|
*/
const fetch = require("node-fetch");

const express = require("express");

// import models so we can interact with the database
const User = require("./models/user");
const Weather = require("./models/weather");

// import authentication library
const auth = require("./auth");

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

function convertToJSON(res) {
  if (!res.ok) {
    throw `API request failed with response status ${res.status} and text: ${res.statusText}`;
  }

  return res
    .clone() // clone so that the original is still readable for debugging
    .json() // start converting to JSON object
    .catch((error) => {
      // throw an error containing the text that couldn't be converted to JSON
      return res.text().then((text) => {
        throw `API request's result could not be converted to a JSON object: \n${text}`;
      });
    });
}

function findWeather(lat, lon, datetime){
    let beginDt = new Date(datetime.valueOf());
    beginDt.setHours(0, 0, 0, 0);
    let endDt = new Date(beginDt.valueOf());
    endDt.setDate(beginDt.getDate() + 1);
    return Weather.findOne({lat: lat, lon: lon, datetime: {$gte: datetime, $lte: endDt}});
}

router.get("/weather", async (req, res) => {
    let lat = req.query.lat;
    let lon = req.query.lon;
    let desiredDt = new Date(parseInt(req.query.dateTime));
    let cachedData = await findWeather(lat, lon, desiredDt);
    if (cachedData != null){
        // console.log("cache hit at " + cachedData.lat + ", " + cachedData.lon + " for " + cachedData.address)
        res.send({snow: cachedData.snow, precip: cachedData.precip});
        return;
    }
    // console.log("miss at " + lat + ", " + lon)

    fetch(`https://api.weatherbit.io/v2.0/forecast/daily?key=${process.env.WEATHER_API_KEY}&lat=${lat}&lon=${lon}`)
        .then(convertToJSON).then((resp) => {
            let address = [resp.city_name, resp.state_code, resp.country_code].join(", ");
            // cache all responses into the database
            resp.data.forEach((data)=>{
                const newWeather = new Weather({
                    address: address,
                    lat: Math.round(lat * 100) / 100,
                    lon: Math.round(lon * 100) / 100,
                    datetime: new Date(data.valid_date), //TODO: include time as well
                    snow: data.snow,
                    precip: data.precip
                });
                newWeather.save();
            });
            // extract the appropriate date and send TODO: assert that index > 0 and < 16
            let index = desiredDt.getDate() - new Date(Date.now()).getDate();
            // console.log("first api")
            res.send({snow: resp.data[index].snow, precip: resp.data[index].precip});
        }).catch((error) => {
            console.log(error)
            // try other api
            fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly&appid=${process.env.OPEN_WEATHER_API_KEY}`)
                .then(convertToJSON).then((resp) => {
                    // cache all responses into the database
                    resp.daily.forEach((data)=> {
                        const newWeather = new Weather({
                            address: "",
                            lat: Math.round(lat * 100) / 100,
                            lon: Math.round(lon * 100) / 100,
                            datetime: new Date(data.dt), //TODO: include time as well
                            snow: data.snow ? data.snow : 0,
                            precip: data.rain ? data.rain : 0
                        });
                        newWeather.save();
                    });

                    // extract the appropriate date and send TODO: assert that index > 0 and < 7
                    let index = new Date(Date.now()).getDate() - desiredDt.getDate();
                    let snow = resp.daily[index].snow ? resp.daily[index].snow : 0;
                    let precip = resp.daily[index].rain ? resp.daily[index].rain : 0;
                    // console.log("second api")
                    res.send({snow: snow, precip: precip});
                }).catch((error) => {
                    console.log(error)
                    res.status(500).send({error: "Woops! Something went wrong"});
                });
        });
});

router.post("/login", auth.login);
router.post("/logout", auth.logout);
router.get("/whoami", (req, res) => {
    if (!req.user) {
        // not logged in
        return res.send({});
    }

    res.send(req.user);
});

// |------------------------------|
// | write your API methods below!|
// |------------------------------|

// anything else falls to this "not found" case
router.all("*", (req, res) => {
    console.log(`API route not found: ${req.method} ${req.url}`);
    res.status(404).send({msg: "API route not found"});
});

module.exports = router;
