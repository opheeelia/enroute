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

function findWeather(){

}

router.get("/weather", (req, res) => {
    // TODO: cache into db

    let lat = req.query.lat;
    let lon = req.query.lon;
    fetch(`https://api.weatherbit.io/v2.0/forecast/daily?key=${process.env.WEATHER_API_KEY}&lat=${lat}&lon=${lon}`)
        .then(convertToJSON).then((resp) => {
            // cache all responses into the database
            resp.data.forEach((data)=>{
                const newWeather = new Weather({
                    city: data.city_name,
                    state: data.state_code,
                    country: data.country_code,
                    lat: Math.round(lat * 100) / 100,
                    lon: Math.round(lon * 100) / 100,
                    datetime: new Date(data.valid_date), //TODO: include time as well
                    snow: data.snow,
                    precip: data.precip
                });
                newWeather.save();
            });
            // extract the appropriate date and send TODO: assert that index > 0 and < 16
            let index = new Date(Date.now()).getDate() - new Date(parseInt(req.query.dateTime)).getDate();
            res.send({snow: resp.data[index].snow, precip: resp.data[index].precip});
        }).catch((error) => {
            // try other api
            fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly&appid=${process.env.OPEN_WEATHER_API_KEY}`)
                .then(convertToJSON).then((resp) => {
                    // cache all responses into the database
                    resp.daily.forEach((data)=> {
                        const newWeather = new Weather({
                            city: "",
                            state: "",
                            country: "",
                            lat: Math.round(lat * 100) / 100,
                            lon: Math.round(lon * 100) / 100,
                            datetime: new Date(data.dt), //TODO: include time as well
                            snow: data.snow ? data.snow : 0,
                            precip: data.rain ? data.rain : 0
                        });
                        newWeather.save();
                    });

                    // extract the appropriate date and send TODO: assert that index > 0 and < 7
                    let index = new Date(Date.now()).getDate() - new Date(parseInt(req.query.dateTime)).getDate();
                    res.send({snow: resp.daily[index].snow, precip: resp.daily[index].rain});
                }).catch((error) => {
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
