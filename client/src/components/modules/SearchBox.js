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

    incrDuration = () => {
        let newValue = this.state.durationHr + 1;
        this.setState({durationHr: newValue});
        this.props.handleSetDuration(this.props.stopKey, newValue);
    };

    decrDuration = () => {
        let newValue = Math.max(1, this.state.durationHr - 1);
        this.setState({durationHr: newValue});
        this.props.handleSetDuration(this.props.stopKey, newValue);
    };

    // onPlaceSelected = place => {
    //     this.setState({address: place['formatted_address']})
    // };

    render(){
        return(
            // <Autocomplete
            //     style={{width: '90%'}}
            //     onPlaceSelected={this.onPlaceSelected}
            //     types={['(regions)']}
            ///>
            <div className="search-box">
                {/*{console.log(this.state.address)}*/}
                <PlacesAutocomplete
                    value={this.state.address}
                    onChange={this.handleChange}
                    onSelect={this.handleSelect}
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
                          {loading && <div>Loading...</div>}
                          {suggestions.map(suggestion => {
                            const className = suggestion.active
                              ? 'suggestion-item--active'
                              : 'suggestion-item';
                            // inline style for demonstration purpose
                            const style = suggestion.active
                              ? { backgroundColor: '#fafafa', cursor: 'pointer' }
                              : { backgroundColor: '#ffffff', cursor: 'pointer' };
                            return (
                              <div key={suggestion}
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
                <p>{this.state.durationHr}</p> <button onClick={this.incrDuration}>+</button> <button onClick={this.decrDuration}>-</button>
                <button onClick={()=>this.props.deleteStop(this.props.stopKey)}>Remove Stop</button>
            </div>
        );
    }

}

export default SearchBox;
