import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App.js";

var script = document.createElement('script');
script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_API_KEY}&libraries=places,geometry,drawing&callback=initMap`;
script.async = true;

// Attach your callback function to the `window` object
window.initMap = function() {
    // JS API is loaded and available
    // renders React Component "Root" into the DOM element with ID "root"
    ReactDOM.render(<App />, document.getElementById("root"));
};

// Append the 'script' element to 'head'
document.head.appendChild(script);

// allows for live updating
module.hot.accept();
