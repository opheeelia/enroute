import React, { Component } from "react";
import WeatherTile from "./WeatherTile";

class WeatherDisplay extends Component{
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    componentDidMount(){
    }

    render(){
        let notableStops = this.props.notableStops.map((loc) => <WeatherTile loc={loc}/>);

        return (
            <div className="weather-block">
                {notableStops}
            </div>
        );

    }
}

export default WeatherDisplay;