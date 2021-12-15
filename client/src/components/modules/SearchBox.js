import React, { Component } from "react";
// import Autocomplete from "react-google-autocomplete";
import PlacesAutocomplete from 'react-places-autocomplete';
import { getAddressFromLatLng } from "../../utilities";

class SearchBox extends Component{

    handleChange = address => {
        this.props.handleChange(this.props.stopKey, address);
    };

    handleSelect = address => {
        this.props.handleSelect(this.props.stopKey, address);
    };

    handleDurationChange = (e) => {
        let newDur = parseInt(e.target.value);
        this.props.handleSetDuration(this.props.stopKey, newDur);
    };

    incrDuration = () => {
        let newValue = this.props.durationHr + 1;
        this.props.handleSetDuration(this.props.stopKey, newValue);
    };

    decrDuration = () => {
        let newValue = Math.max(0, this.props.durationHr - 1);
        this.props.handleSetDuration(this.props.stopKey, newValue);
    };

    getLocation = async (event) => {
      if ("geolocation" in navigator){
        navigator.geolocation.getCurrentPosition(async (position) => {
          getAddressFromLatLng(
            parseFloat(position.coords.latitude),
            parseFloat(position.coords.longitude),
            this.handleSelect
          );          
        });
      }
    }

    // onPlaceSelected = place => {
    //     this.setState({address: place['formatted_address']})
    // };

    render(){

        let durationInput = (this.props.stopKey == 0) ? 
            <div className="m-auto">
              <button className="btn btn-outline-dark" onClick={this.getLocation}>Use my location</button>
            </div>
            :
            <div className="duration-input input-group align-items-center">
                <label className="mx-2">Duration (hrs)</label>
                <button className="btn btn-outline-secondary" onClick={this.decrDuration}>-</button>
                <input type="number" className="form-control" id="duration-input"
                       aria-label="Duration in hours spent at this location"
                       value={this.props.durationHr}
                       onChange={this.handleDurationChange}
                />
                <button className="btn btn-outline-secondary" onClick={this.incrDuration}>+</button>
            </div>;

        return(
            <div className="search-box card col input-group m-2 p-3 gap-3">
                <PlacesAutocomplete
                    value={this.props.address}
                    onChange={this.handleChange}
                    onSelect={this.handleSelect}
                    className=""
                >
                    {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                      <div>
                        <input
                          {...getInputProps({
                            placeholder: 'Location...',
                            className: 'location-search-input',
                          })}
                        />
                        <div className="autocomplete-dropdown-container">
                          {loading && <div className="dropdown-suggestion">Loading...</div>}
                          {suggestions.map((suggestion, i) => {
                            const className = suggestion.active
                              ? 'suggestion-item--active dropdown-suggestion'
                              : 'suggestion-item dropdown-suggestion';
                            // inline style for demonstration purpose
                            const style = suggestion.active
                              ? { backgroundColor: '#fafafa', cursor: 'pointer' }
                              : { backgroundColor: '#ffffff', cursor: 'pointer' };
                            return (
                              <div key={i}
                                {...getSuggestionItemProps(suggestion, {
                                  className,
                                  style,
                                })}
                              >
                                <span>{suggestion.description}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                </PlacesAutocomplete>
                {this.props.locInvalid ? <div className="error">Please enter a valid location</div> : null}
                {durationInput}
                {this.props.durInvalid ? <div className="error">Duration requires predicting too far into the future! Try decreasing duration, removing stops, or starting earlier.</div> : null}
                <button className="btn ms-auto" onClick={()=>this.props.deleteStop(this.props.stopKey)}>
                    <i className="bi bi-x-circle"></i>
                </button>
            </div>
        );
    }

}

export default SearchBox;
