import React from 'react';
import { MapStyles } from './Data.js'
/* global google */

const lineColor = "#409F9F";
const labelColor = "#ffAA55";

export class Map extends React.Component {
    constructor(props) {
        super(props);
        this.mapref = React.createRef();
    }

    componentDidMount() {
        var map = new google.maps.Map(
            this.mapref.current, {
            zoom: 10,
            center: this.props.origin,
            mapTypeId: "terrain",
            styles: MapStyles.data
        });
        new google.maps.Marker({
            position: this.props.origin,
            map,
            title: "You",
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                strokeColor: lineColor,
                scale: 10,
            },
            label: {
                text: "You",
                color: labelColor,
                fontSize: "16px",
                fontWeight: "bold"
              },
        });
        new google.maps.Marker({
            position: this.props.destination,
            map,
            title: this.props.destination.name,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                strokeColor: lineColor,
                scale: 10,
            },
            label: {
                text: this.props.destination.name,
                color: labelColor,
                fontSize: "16px",
                fontWeight: "bold"
              },
        });
        var directionsMap = new google.maps.DirectionsRenderer({
            suppressMarkers: true,
            polylineOptions: { strokeColor: lineColor } 
        });
        directionsMap.setMap(map);
        this.getDirections(this.props.origin,this.props.destination,directionsMap);
    }

    getDirections(origin,destination,map) {
        const directionsService = new google.maps.DirectionsService();

        directionsService.route({
                origin: origin,
                destination: destination,
                travelMode: google.maps.TravelMode.DRIVING
            },(result, status) => {
                if (status === google.maps.DirectionsStatus.OK) {
                    map.setDirections(result);
                } else {
                    console.error(result);
                }
            }
        );
    }

    render() {
        return <div id='map' ref={this.mapref}></div>;
    }
}
export default Map;