import React from 'react';
import { MapStyles } from './Data.js'
import { Hots } from './Data.js'
/* global google */

const lineColor = '#409F9F';
const labelColor = '#ffAA55';

export class Map extends React.Component {
    constructor(props) {
        super(props);
        this.mapref = React.createRef();
    }

    componentDidMount() {
        let hots = this.striaghtDistances(this.props.origin,Hots.data)
                    .sort((a,b) => a.striaghtDistance - b.striaghtDistance)
                    .slice(0,9);//distanceMatrix is limited to 25, slicing to 10 for speed

        this.drivingDistances(this.props.origin,hots).then(results=>{
            results.forEach((distance,index) => hots[index].drivingDistance = distance);
            const closest = hots.sort((a,b) => a.drivingDistance - b.drivingDistance)[0];
            this.directions(this.props.origin,closest).then(result => this.createMap(closest,result))
        });
    }

    striaghtDistances(origin,destinations) {
        return destinations.map(dest => {
            dest.striaghtDistance = Math.sqrt(Math.pow(origin.lat - dest.lat, 2) 
                                            + Math.pow(origin.lng - dest.lng, 2));
            return dest
        });
    }

    drivingDistances(origin, destinations) {
        const service = new google.maps.DistanceMatrixService();
        return new Promise((resolve, reject) => {
            service.getDistanceMatrix({
                origins: [origin],
                destinations: destinations,
                travelMode: google.maps.TravelMode.DRIVING,
            }, (response, status) => {
                if(status === 'OK') {
                    resolve(response.rows[0].elements.map(resp=>resp.distance.value));
                } else {
                    reject(new Error('Error getting distance'));
                }
            });
        });
    }

    directions(origin,destination) {
        const service = new google.maps.DirectionsService();
        return new Promise((resolve, reject) => {
            service.route({
                origin: origin,
                destination: destination,
                travelMode: google.maps.TravelMode.DRIVING
            },(response, status) => {
                if (status === google.maps.DirectionsStatus.OK) {
                    resolve(response);
                } else {
                    reject(new Error('Error getting directions'));
                }
            });
        });
    }

    createMap(destination,directions) {
        let map = new google.maps.Map(
            this.mapref.current, {
            zoom: 10,
            center: this.props.origin,
            mapTypeId: 'terrain',
            styles: MapStyles.data
        });
        this.addMarker(this.props.origin,map);
        this.addMarker(destination,map);
        let directionsMap = new google.maps.DirectionsRenderer({
            suppressMarkers: true,
            polylineOptions: { strokeColor: lineColor } 
        });
        directionsMap.setMap(map);
        directionsMap.setDirections(directions);
    }

    addMarker(location,map) {
        new google.maps.Marker({
            position: location,
            map,
            title: location.name,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                strokeColor: lineColor,
                scale: 10,
            },
            label: {
                text: location.name,
                color: labelColor,
                fontSize: '16px',
                fontWeight: 'bold'
            },
        });
    }

    render() {
        return <div id='map' ref={this.mapref}></div>;
    }
}
export default Map;