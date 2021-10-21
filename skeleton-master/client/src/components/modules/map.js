import React, { Component } from "react";
import {withGoogleMap, withScriptjs, GoogleMap, DirectionsRenderer} from "react-google-maps";
import { compose, withProps, lifecycle } from "recompose";
/* global google */

class Map extends Component{

    componentDidMount(){
        console.log('mounting outside');
    }

    // componentDidUpdate(){
    //     this.setState({
    //         stops: this.props.stops.slice(),
    //     });
    //     console.log('here too');
    //     // console.log(this.props.stops[this.props.stops.length - 1].address);
    // }

    shouldComponentUpdate(prevProps, prevState){
        console.log(this.props.stops);
        console.log(prevProps.stops);
        console.log(this.props.stops != prevProps.stops);
        return (this.props.stops != prevProps.stops);
    }

    render(){
        console.log(this.props.stops);
        const WrappedMap = compose(
            withProps({
                googleMapURL: "https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=AIzaSyC-VbONRxsVcwEZYcPwfEsoBtRecgHOuU4",
                loadingElement: <div style={{ height: `100%` }} />,
                containerElement: <div style={{ height: `600px` }} />,
                mapElement: <div style={{ height: `100%` }} />,
                stops: this.props.stops.slice(),
                updateDirections: (res) => this.props.updateDirections(res),
            }),
            withScriptjs,
            withGoogleMap,
            lifecycle({
                componentDidMount(){
                    // console.log('mounting inner');
                    const DirectionsService = new google.maps.DirectionsService();
                    // const stops = this.props.stops.slice();

                    console.log(this.props.stops);

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
                },
            })
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