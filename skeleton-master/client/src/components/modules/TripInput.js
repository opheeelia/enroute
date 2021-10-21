import React, {Component} from "react";
import SearchBox from "../modules/SearchBox";
import {geocodeByAddress, getLatLng} from "react-places-autocomplete";

class TripInput extends Component {

    static MAX_STOPS = 8;

    constructor(props) {
        super(props);

        this.state = {
            stopCounter: 2,
            waypoints: this.props.stops.slice(),
        };
    }

    addStop = () => {
        if (this.state.stopCounter < TripInput.MAX_STOPS) {
            let boxId = this.state.stopCounter;
            this.setState({
                stopCounter: boxId + 1,
                waypoints: this.state.waypoints.concat([{id: boxId, address: "", latlng: null,}])
            });
        } else {

        }
    };

    // deleteStop = boxId => {
    //     let updatedStops = this.state.waypoints.filter((item)=> (item.id != boxId));
    //     this.setState({waypoints: updatedStops});
    // };

    deleteStop = stopKey => {
        let newStops = [...this.state.waypoints];
        newStops.splice(stopKey, 1);
        this.setState({waypoints: newStops});
    };

    handleSelect = (boxKey, address) => {
        let origStops = this.state.waypoints;
        geocodeByAddress(address)
            .then(results => getLatLng(results[0]))
            .then(latLng => {
                origStops[boxKey].address = address;
                origStops[boxKey].latlng = latLng;
                this.setState({waypoints: origStops});
            })
            .catch(error => console.error('Error', error));
    };

    render() {

        let searchBoxList = this.state.waypoints.map((stop, key) => (
            <SearchBox key={key} id={stop.id} stopKey={key}
                       address={stop.address}
                       deleteStop={this.deleteStop}
                       handleSelect={this.handleSelect}
            />));

        let today = new Date(Date.now());
        const offset = today.getTimezoneOffset();
        today = new Date(today.getTime() - (offset*60*1000));
        let todayString = today.toISOString().split('T')[0].replaceAll("/", "-");
        today.setDate(today.getDate() + 14);
        let twoWeeksString = today.toISOString().split('T')[0].replaceAll("/", "-");

        return (
            <div className="user-input">
                <input type="date" id="start" name="trip-start"
                       value={todayString}
                       min={todayString}
                       max={twoWeeksString}
                   />
                <button onClick={this.addStop}>Add stop</button>
                {searchBoxList}
                <button onClick={() => this.props.submitStops(this.state.waypoints)}>Submit!</button>
            </div>);
    }
}

export default TripInput;