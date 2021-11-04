import React, {Component} from "react";
import SearchBox from "../modules/SearchBox";
import {geocodeByAddress, getLatLng} from "react-places-autocomplete";

class TripInput extends Component {

    static MAX_STOPS = 8;

    constructor(props) {
        super(props);

        this.state = {
            defaultDurationHr: 24,
            stopCounter: 2,
            waypoints: this.props.stops.slice(),
        };
    }

    setDDefaultDuration = (newDefaultDuration) => {
      this.setState({
          defaultDurationHr: newDefaultDuration
      });
      //TODO: update all of the stops to have default value
    };

    addStop = () => {
        if (this.state.waypoints.length < TripInput.MAX_STOPS) {
            let boxId = this.state.stopCounter;
            this.setState({
                stopCounter: boxId + 1,
                waypoints: this.state.waypoints.concat([{id: boxId, address: "", latlng: null, durationHr: this.state.defaultDurationHr}])
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

    handleSetDuration = (boxKey, durationHr) => {
        let stops = this.state.waypoints;
        stops[boxKey].durationHr = durationHr;
        this.setState({waypoints: stops});
    };

    render() {

        let searchBoxList = this.state.waypoints.map((stop, key) => (
            <SearchBox key={key} id={stop.id} stopKey={key}
                       address={stop.address}
                       deleteStop={this.deleteStop}
                       handleSelect={this.handleSelect}
                       handleSetDuration={this.handleSetDuration}
                       durationHr={stop.durationHr}
            />));

        let today = new Date(Date.now());
        const offset = today.getTimezoneOffset();
        today = new Date(today.getTime() - (offset*60*1000));
        let twoWeeks = new Date(today.valueOf() + 14*24*60*60*1000);
        // string versions to put
        let chosenStartString = new Date(this.props.start  - (offset*60*1000)).toISOString().split(".")[0];
        let todayString = today.toISOString().split(".")[0];

        let twoWeeksString = twoWeeks.toISOString().split(".")[0];

        return (
            <div className="user-input">
                <p>Start Date of Trip:</p>
                <input type="datetime-local" id="start" name="trip-start"
                       value={chosenStartString.substring(0,chosenStartString.length-3)}
                       min={todayString.substring(0,todayString.length-3)}
                       max={twoWeeksString.substring(0,twoWeeksString.length-3)}
                       onChange={this.props.updateStart}
                   />
                <br></br>
                <button onClick={this.addStop}>Add stop</button>
                {searchBoxList}
                <button onClick={() => this.props.updateStops(this.state.waypoints)}>Submit!</button>
            </div>);
    }
}

export default TripInput;