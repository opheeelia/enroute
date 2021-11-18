import React, { Component } from "react";
import {withGoogleMap, withScriptjs, GoogleMap, DirectionsRenderer} from "react-google-maps";
import { compose, withProps, lifecycle, shouldUpdate } from "recompose";
import {objectEquals, arrayEquals} from "../../utilities";
/* global google */

class Map extends Component{

    constructor(props) {
        super(props);
        this.state = {
            directions: null
        };
    }

    shouldComponentUpdate(prevProps, prevState){
        return !arrayEquals(prevProps.stops, this.props.stops) || !objectEquals(prevState.directions, this.state.directions);
    }

    componentDidUpdate(){
        const DirectionsService = new google.maps.DirectionsService();

        let routeReqData = this.props.stops.length <= 2 ? {
            origin: this.props.stops[0].latlng,
            destination: this.props.stops[this.props.stops.length-1].latlng,
            travelMode: google.maps.TravelMode.DRIVING,
        } : {
            origin: this.props.stops[0].latlng,
            waypoints: this.props.stops.slice(1,this.props.stops.length-1).map((point)=> ({location: point.latlng, stopover: true})),
            destination: this.props.stops[this.props.stops.length-1].latlng,
            travelMode: google.maps.TravelMode.DRIVING,
        };

        DirectionsService.route(routeReqData, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
                this.setState({
                    directions: result,
                });
                this.props.updateDirections(result);
            } else {
                console.error(`error fetching directions ${result}`);
            }
        });
    }

    render(){
        const WrappedMap = compose(
            withProps({
                googleMapURL: `https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=${process.env.REACT_APP_GOOGLE_API_KEY}`,
                loadingElement: <div style={{ height: `100%` }} />,
                containerElement: <div style={{ height: `600px` }} />,
                mapElement: <div style={{ height: `100%` }} />,
                directions: this.state.directions
            }),
            withScriptjs,
            withGoogleMap
            )(props =>
              <GoogleMap
                defaultZoom={7}
                defaultCenter={new google.maps.LatLng(41.8507300, -87.6512600)}
              >
                {props.directions && <DirectionsRenderer directions={props.directions} />}
              </GoogleMap>
            );

        return <WrappedMap/>;

    }

}

export default Map;