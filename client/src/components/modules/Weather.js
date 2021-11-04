import React, { Component } from "react";
import {get} from "../../utilities";

class Weather extends Component{
    constructor(props) {
        super(props);
    }

    componentDidMount(){
    }

    render(){
        let notableStops = this.props.notableStops.map((loc) => {
                // get("/api/weather", {lat: loc.lat, lon: loc.lng}).then(r =>console.log(r));
                return <p>{loc.city + ", " + loc.state + ", " + loc.country + ": " + new Date(loc.elapsedSec * 1000).toString()}</p>;
            }
        );

        return (
            <div className="weather-block">
                {notableStops}
            </div>
        );

    }
}

export default Weather;