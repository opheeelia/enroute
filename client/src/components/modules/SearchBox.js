import React, { Component } from "react";
// import Autocomplete from "react-google-autocomplete";
import PlacesAutocomplete from 'react-places-autocomplete';

class SearchBox extends Component{

    constructor(props) {
        super(props);
        this.state = {
            address: this.props.address,
            durationHr: this.props.durationHr
        };
    }

    componentDidUpdate(prevProps){
        if(this.props.address != prevProps.address){
            this.setState({
                address: this.props.address,
            });
        }
    }

    handleChange = address => {
        this.setState({address: address });
    };

    handleSelect = address => {
        this.setState({address: address});
        this.props.handleSelect(this.props.stopKey, address);
    };

    handleDurationChange = (newDur) => {
        this.setState({durationHr: newDur});
        this.props.handleSetDuration(this.props.stopKey, newDur);
    };

    incrDuration = () => {
        let newValue = this.state.durationHr + 1;
        this.setState({durationHr: newValue});
        this.props.handleSetDuration(this.props.stopKey, newValue);
    };

    decrDuration = () => {
        let newValue = Math.max(0, this.state.durationHr - 1);
        this.setState({durationHr: newValue});
        this.props.handleSetDuration(this.props.stopKey, newValue);
    };

    // onPlaceSelected = place => {
    //     this.setState({address: place['formatted_address']})
    // };

    render(){

        let durationInput = (this.props.stopKey == 0) ? <div></div> :
            <div className="duration-input input-group align-items-center">
                <label className="mx-2">Duration (hrs)</label>
                <button className="btn btn-outline-secondary" onClick={this.decrDuration}>-</button>
                <input type="number" className="form-control" id="duration-input"
                       aria-label="Duration in hours spent at this location"
                       value={this.state.durationHr}
                       onChange={this.handleDurationChange}
                />
                <button className="btn btn-outline-secondary" onClick={this.incrDuration}>+</button>
            </div>;

        return(
            <div className="search-box card col input-group m-2 p-3">
                <PlacesAutocomplete
                    value={this.state.address}
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
                {durationInput}
                <button className="btn ms-auto" onClick={()=>this.props.deleteStop(this.props.stopKey)}>
                    <i className="bi bi-x-circle"></i>
                </button>
            </div>
        );
    }

}

export default SearchBox;
