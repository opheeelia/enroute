import React, {Component} from "react";
import GoogleLogin, {GoogleLogout} from "react-google-login";
import Map from "../modules/map";
/* global google*/

import "../../utilities.css";
import "./Skeleton.css";
import TripInput from "../modules/TripInput";
import Geocode from "react-geocode";
import Weather from "../modules/Weather";


// //TODO: REPLACE WITH YOUR OWN CLIENT_ID
const GOOGLE_CLIENT_ID = "121479668229-t5j82jrbi9oejh7c8avada226s75bopn.apps.googleusercontent.com";

class Skeleton extends Component {
    constructor(props) {
        super(props);

        Geocode.setApiKey("AIzaSyC-VbONRxsVcwEZYcPwfEsoBtRecgHOuU4");
        // Initialize Default State
        this.state = {
            stops: [{id: 0, address: "", latlng: new google.maps.LatLng(41.8507300, -87.6512600)},
                {id: 1, address: "", latlng: new google.maps.LatLng(41.8525800, -87.6514100)}],
            notableStops: [],
            start: Date.now()
        };
    }

    componentDidMount() {
        // remember -- api calls go here!
    }

    updateStart = (newStart) => {
        this.setState({start: newStart});
    }

    updateStops = (newState) => {
        this.setState({stops: newState});
    };

    updateRoute = async (newDir) => {
        // updates the notable stops (cities stopping at) by looking through the directions
        let notableStops = await newDir.routes[0].legs.map(async (leg) => {
            let duplicatedStops = await leg.steps.flatMap(async (step) => {
                return await Geocode.fromLatLng(step.end_location.toJSON().lat, step.end_location.toJSON().lng).then(response => {
                        let city = "";
                        let state = "";
                        let country = "";
                        response.results[0].address_components.map((info) => {
                            if (info.types.includes("administrative_area_level_1")) {
                                state = info.short_name;
                            } else if (info.types.includes("locality") || info.types.includes("sublocality")) {
                                city = info.short_name;
                            } else if (info.types.includes("country")) {
                                country = info.short_name;
                            }
                        });
                        if (city != "" && state != "" && country != "") {
                            return {
                                city: city,
                                state: state,
                                country: country,
                                lat: step.end_location.toJSON().lat,
                                lng: step.end_location.toJSON().lng,
                                duration: step.duration.value
                            };
                        }
                    },
                    error => {
                        console.error(error);
                    });
            });

            return Promise.all(duplicatedStops).then((stops) => {
                let deduplicatedStops = [];
                // TODO: better way to dedup?
                for (const i in stops) {
                    if (stops[i] != null){
                        if (!deduplicatedStops.some((otherStop) => stops[i].city == otherStop.city && stops[i].state == otherStop.state && stops[i].country == otherStop.country)) {
                            deduplicatedStops.push(stops[i]);
                        }
                    }
                }
                return deduplicatedStops;
            });
        });

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
                        <TripInput submitStops={this.updateStops} stops={this.state.stops}/>
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
