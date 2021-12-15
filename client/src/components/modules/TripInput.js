import React, {Component} from "react";
import SearchBox from "../modules/SearchBox";
import {geocodeByAddress, getLatLng} from "react-places-autocomplete";
import Geocode from "react-geocode";
import {copyStops} from "../../utilities";

class TripInput extends Component {

    static MAX_STOPS = 8;
    static MAX_FUTURE_HRS = 7 * 24;

    constructor(props) {
        super(props);
        this.state = {
            defaultDurationHr: 24,
            stopCounter: 2,
            waypoints: copyStops(this.props.stops), // just to get initial empty stops TODO: change to not depend on props
            stopErrorMsg: ""
        };
    }

    setDefaultDuration = (newDefaultDuration) => {
      this.setState({
          defaultDurationHr: newDefaultDuration
      });
      //TODO: update all of the stops to have default value
    };

    submitStops = () => {
        // validate the locations (if non-empty)
        let elapsedHr = 0;
        let valid = true;
        let valStops = this.state.waypoints.map(async (element, i) => {
            elapsedHr += element.durationHr;
            if (elapsedHr >= TripInput.MAX_FUTURE_HRS){
                element.durInvalid = true;
                valid = false;
            } else {
                element.durInvalid = false;
            }
            if (element.address.length == 0){
                element.locInvalid = true;
                valid = false;
            } else {
                element.locInvalid = false;
                // TODO: find a way to validate addresses
                // await Geocode.fromAddress(element.address).then((e)=>{
                //     element.locInvalid = false;
                // }).catch((e)=>{
                //     element.locInvalid = true;
                //     valid = false;
                // });
            }
            return element;
        });
        Promise.all(valStops).then((stops) => {
            this.setState({waypoints: stops, stopErrorMsg: ""});
        });
        if (valid) this.props.updateStops(this.state.waypoints);
    };

    addStop = () => {
        if (this.state.waypoints.length < TripInput.MAX_STOPS) {
            let boxId = this.state.stopCounter;
            this.setState({
                stopCounter: boxId + 1,
                waypoints: this.state.waypoints.concat([{id: boxId, address: "", latlng: null, durationHr: this.state.defaultDurationHr}])
            });
        } else {
            // TODO: popup message to tell user max stops reached
            this.setState({stopErrorMsg: `Maximum of ${TripInput.MAX_STOPS} stops reached.`});
            // document.getElementById("stops-error-msg").innerHTML = `Maximum of ${TripInput.MAX_STOPS} stops reached.`;
        }
    };

    // deleteStop = boxId => {
    //     let updatedStops = this.state.waypoints.filter((item)=> (item.id != boxId));
    //     this.setState({waypoints: updatedStops});
    // };

    deleteStop = stopKey => {
        if (this.state.waypoints > 2){
            let newStops = [...this.state.waypoints];
            newStops.splice(stopKey, 1);
            this.setState({waypoints: newStops});
        } else {
            // TODO: pop-up that tells user a minimum of 2 stops are required
            this.setState({stopErrorMsg: "Must have at least 2 stops"});
        }
    };

    handleChange = (boxKey, address) => {
        let origStops = copyStops(this.state.waypoints);
        origStops[boxKey].address = address;
        origStops[boxKey].latlng = null;
        this.setState({waypoints: origStops});
    }

    handleSelect = (boxKey, address) => {
        let origStops = copyStops(this.state.waypoints);
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
        let stops = copyStops(this.state.waypoints);
        stops[boxKey].durationHr = durationHr;
        this.setState({waypoints: stops});
    };

    render() {
        let searchBoxList = this.state.waypoints.map((stop, key) => (
            <SearchBox key={key} id={stop.id} stopKey={key}
                       address={stop.address}
                       deleteStop={this.deleteStop}
                       handleChange={this.handleChange}
                       handleSelect={this.handleSelect}
                       handleSetDuration={this.handleSetDuration}
                       durationHr={stop.durationHr}
                       locInvalid={stop.locInvalid}
                       durInvalid={stop.durInvalid}
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
            <div className="user-input container">
                <div className="init-input">
                    <div className="row">
                        <p className="col-md-auto col-sm-auto col-lg-auto fs-5 fw-bold">
                            Start Date of Trip:
                        </p>
                        <input type="datetime-local" id="start" name="trip-start"
                               className="col"
                               value={chosenStartString.substring(0,chosenStartString.length-3)}
                               min={todayString.substring(0,todayString.length-3)}
                               max={twoWeeksString.substring(0,twoWeeksString.length-3)}
                               onChange={this.props.updateStart}
                           />
                    </div>
                    <div className="row justify-content-center">
                        <button className="btn btn-primary col-3 mt-3" onClick={this.addStop}>
                            Add stop
                        </button>
                        <div id="stops-error-msg" className="error">{this.state.stopErrorMsg}</div>
                    </div>
                </div>
                <div className="row">{searchBoxList}</div>
                <div className="row justify-content-center">
                    <button className="btn btn-primary" onClick={this.submitStops}>
                        Submit!
                    </button>
                </div>
            </div>);
    }
}

export default TripInput;