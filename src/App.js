import React from 'react';
import './App.css';
import Button from 'react-bootstrap/Button';
import { Hots } from './Data.js'
import Map from './Map.js'

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {show:false,origin:null};
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const origin = {lat:position.coords.latitude,lng:position.coords.longitude};
                this.setState({ 
                    origin:origin,
                    destination:this.getClosest(origin,Hots.data)
                });
                console.log("position found");
            },(error) => { 
                console.log(error); 
            },{timeout:3000});
    }

    getClosest(origin,destinations) {
        var min = Number.MAX_VALUE;
        var destination;
        destinations.forEach(dest => {
            var distance = Math.sqrt(Math.pow(origin.lat - dest.lat, 2) + Math.pow(origin.lng - dest.lng, 2));
            if (distance < min) {
                destination = dest;
                min = distance;
            }
        });
        return destination;
    }

    checkOrigin() {
        if (this.state.origin === null) {
            alert("Turn Location Services on");
        } else {
            this.setState({show:!this.state.show})
        }
    }

    render() {
        return (
            <>
            {!this.state.show && <Button className="finder" variant="dark" onClick={() => this.checkOrigin()}><h1>Find the Nearest Garbage Plate</h1></Button>}
            {this.state.show && <Map origin={this.state.origin} destination={this.state.destination} />}
            </>
        );
    }
}
export default App;