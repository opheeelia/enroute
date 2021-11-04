import React, {Component} from "react";
import GoogleLogin, {GoogleLogout} from "react-google-login";
import Map from "../modules/map";
/* global google*/

import "../../utilities.css";
import "./Skeleton.css";
import TripInput from "../modules/TripInput";
import Geocode from "react-geocode";
import Weather from "../modules/Weather";
import {removeConsecutiveDuplicates, sameCity} from "../../utilities";


// //TODO: REPLACE WITH YOUR OWN CLIENT_ID
const GOOGLE_CLIENT_ID = "121479668229-t5j82jrbi9oejh7c8avada226s75bopn.apps.googleusercontent.com";

class Skeleton extends Component {
    constructor(props) {
        super(props);
        Geocode.setApiKey(process.env.REACT_APP_GOOGLE_API_KEY);

        // Initialize Default State
        this.state = {
            stops: [{id: 0, address: "", latlng: new google.maps.LatLng(41.8507300, -87.6512600), durationHr: 0}, //TODO: always ensure the first one has duration 0
                {id: 1, address: "", latlng: new google.maps.LatLng(41.8525800, -87.6514100), durationHr: 24}],
            notableStops: [],
            start: Date.now().valueOf()
        };
    }

    componentDidMount() {
        // remember -- api calls go here!
    }

    updateStart = (newStart) => {
        this.setState({start: newStart.target.value.split(".")[0]});
    }

    updateStops = (newState) => {
        this.setState({stops: newState});
    };

    updateRoute = async (newDir) => {
        let index = 0;
        // updates the notable stops (cities stopping at) by looking through the directions
        let notableStops = await newDir.routes[0].legs.reduce(async (prevLeg, leg) => {
            prevLeg = await prevLeg;
            let prevLegElapsedSec = this.state.stops[index].durationHr * 60 * 60 + prevLeg[prevLeg.length - 1].elapsedSec;
            // get which stop this corresponds to and make a constant on how long to stay
            let routeStops = await leg.steps.reduce(async (stopList, step) => {
                stopList = await stopList;
                let prevStep = stopList[stopList.length -1];
                return await Geocode.fromLatLng(step.end_location.toJSON().lat, step.end_location.toJSON().lng).then(response => {
                        let city = "";
                        let state = "";
                        let country = "";
                        response.results[0].address_components.map((info) => {
                            if (info.types.includes("administrative_area_level_1")) {
                                state = info.short_name;
                            } else if (info.types.includes("locality") || info.types.includes("sublocality")) {
                                city = info.long_name;
                            } else if (info.types.includes("country")) {
                                country = info.short_name;
                            }
                        });
                        if (city != "" && state != "" && country != "") {
                            stopList.push({
                                city: city,
                                state: state,
                                country: country,
                                lat: step.end_location.toJSON().lat,
                                lng: step.end_location.toJSON().lng,
                                elapsedSec: step.duration.value + prevStep.elapsedSec
                            });
                        }
                        return stopList;
                    },
                    error => {
                        console.error(error);
                    });
            }, [{elapsedSec: prevLegElapsedSec}]);

            index++;
            routeStops.splice(0,1);
            removeConsecutiveDuplicates(routeStops);
            prevLeg.push(...routeStops);
            return prevLeg;
        }, [{elapsedSec: ~~(this.state.start / 1000)}]);

        notableStops.splice(0,1);
        removeConsecutiveDuplicates(notableStops);
        Promise.all(notableStops).then((stops) => {
            this.setState({
                 notableStops: stops,
             });
        });
    };

    render() {
        return (
            <>
                <h1>enroute</h1>
                <p>check to see if it will rain / snow any point on your route</p>
                <p>type your destination in the search box below</p>
                {this.props.userId ? (
                    <GoogleLogout
                        clientId={GOOGLE_CLIENT_ID}
                        buttonText="Logout"
                        onLogoutSuccess={this.props.handleLogout}
                        onFailure={(err) => console.log(err)}
                        className="NavBar-link NavBar-login"
                    />) : (
                    <GoogleLogin
                        clientId={GOOGLE_CLIENT_ID}
                        buttonText="Login"
                        onSuccess={this.props.handleLogin}
                        onFailure={(err) => console.log(err)}
                        className="NavBar-link NavBar-login"
                    />)}
                {this.props.userId ?
                    <div className="main-body">
                        <TripInput
                            updateStops={this.updateStops}
                            updateStart={this.updateStart}
                            stops={this.state.stops}
                            start={this.state.start}
                        />
                        <Weather notableStops={this.state.notableStops}/>
                        <div className="mapContainer">
                            <Map stops={this.state.stops} updateDirections={this.updateRoute}/>
                        </div>
                    </div> :
                    <div></div>
                }
            </>
        );
    }
}

export default Skeleton;
