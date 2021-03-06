import React from 'react';
import { MapStyles } from '../Data.js'
import { Hots } from '../Data.js'
import './Map.css';

/* global google */

const lineColor = '#409F9F';
const labelColor = '#FFAA55';

export class Map extends React.Component {
    constructor(props) {
        super(props);
        this.state = {'markers':[]}
        this.mapref = React.createRef();
    }

    componentDidMount() {
        let hots = this.striaghtDistances(this.props.origin,Hots.data)
                    .sort((a,b) => a.striaghtDistance - b.striaghtDistance)
                    .slice(0,24);//distanceMatrix is limited to 25, slicing to 10 for speed

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

    placeDetails(map,placeId) {
        const service = new google.maps.places.PlacesService(map);
        return new Promise((resolve, reject) => {
            service.getDetails({
                placeId: placeId,
                fields: ['name','formatted_address','business_status','opening_hours','utc_offset_minutes'],
            },(response, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    resolve(response);
                } else {
                    reject(new Error(status));
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
        Hots.data.forEach(hot => {
            this.addMarker(hot,this.state.map);
        });

        this.setExtraMapMarkers(null);
        let directionsMap = new google.maps.DirectionsRenderer({
            suppressMarkers: true,
            polylineOptions: { strokeColor: lineColor } 
        });
        directionsMap.setMap(map);
        directionsMap.setDirections(directions);

        let infowindow = new google.maps.InfoWindow();
        this.placeDetails(map,destination.id).then(results => {

            const open = results.opening_hours.isOpen() ? '<span class="open">Open</span>':'<span class="closed">Closed</span>'
            const content = results.name+'<br/>'+results.formatted_address+'<br/>'+ open || '';

            infowindow.setContent(content);
            infowindow.open(map,this.state.markers[1]);

            this.state.markers[1].addListener('click', () => {
                infowindow.open(map,this.state.markers[1]);
            });
        });

        this.setState({'map':map});
    }

    addMarker(location,map) {
        const marker = new google.maps.Marker({
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
        marker.setMap(map);
        this.state.markers.push(marker);
    }

    setExtraMapMarkers(map) {
        for (let i = 2; i < this.state.markers.length; i++) {
            this.state.markers[i].setMap(map);
        }        
    }

    componentDidUpdate(prevProps) {
        if (this.props.addAllMarkers) {
            this.setExtraMapMarkers(this.state.map);
        } else {
            this.setExtraMapMarkers(null);
        }
    }

    render() {
        return <div id='map' ref={this.mapref}></div>;
    }
}
export default Map;