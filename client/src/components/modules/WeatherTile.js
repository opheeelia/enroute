import React, { Component } from "react";
import {getWeather} from "../../utilities";

class WeatherTile extends Component{
    constructor(props) {
        super(props);
        this.state = {
            snow: 0,
            precip: 0
        }
    }

    componentDidMount(){
        getWeather(this.props.loc.lat, this.props.loc.lng, this.props.loc.elapsedSec * 1000, this.updateWeatherTile);
    }

    updateWeatherTile = (data) => {
        this.setState(data);
    }

    render() {
        return (
            <div>
                <p>{this.props.loc.city + ", " + this.props.loc.state + ", " + this.props.loc.country + ": " + new Date(this.props.loc.elapsedSec * 1000).toString()}</p>
                <p>snow {this.state.snow} </p>
                <p>rain {this.state.precip}</p>
            </div>
        );
    }
}

export default WeatherTile;