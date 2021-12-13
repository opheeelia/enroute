import React, { Component } from "react";
import RainIcon from "../../public/rain.svg";
import SnowIcon from "../../public/snow.svg";
import { getWeather } from "../../utilities";

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
        let date = new Date(this.props.loc.elapsedSec * 1000);
        return (
            <div className="weather-card row">
                <img className="col-1" src={this.state.snow ? SnowIcon : (this.state.precip ? RainIcon : "")}/>
                <div className="col">
                    <div className="row">
                        <p className="col"><b>{this.props.loc.address}</b></p>
                        <p className="col">{date.getMonth()}/{date.getDate()}/{date.getFullYear()}</p>
                    </div>
                    <div className="row">
                        <p className="col">Snow: {this.state.snow} mm</p>
                        <p className="col">Rain: {this.state.precip} mm</p>
                    </div>
                </div>
            </div>
        );
    }
}

export default WeatherTile;