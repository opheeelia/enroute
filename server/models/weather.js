const mongoose = require("mongoose");

const WeatherSchema = new mongoose.Schema({
    city: String,
    state: String,
    country: String,
    lat: Number,
    lon: Number,
    datetime: Date,
    snow: Number,
    precip: Number
});

// compile model from schema
module.exports = mongoose.model("weather", WeatherSchema);
