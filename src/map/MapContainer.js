import React from 'react';
import Button from 'react-bootstrap/Button';
import Map from './Map.js'
import './Map.css';

export class MapContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {'markers':false};
    }

    addAllMarkers() {
        this.setState({'markers':!this.state.markers});
    }

    render() {
        return (
            <div id='map-container'>
                <div id='header'><Button variant="outline-warning" onClick={() => this.addAllMarkers()} >{this.state.markers ? 'Hide All' : 'Show All'}</Button></div>
                <Map origin={this.props.origin} addAllMarkers={this.state.markers} />
            </div>
        );
    }
} export default MapContainer