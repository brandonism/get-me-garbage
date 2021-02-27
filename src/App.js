import React from 'react';
import './App.css';
import Button from 'react-bootstrap/Button';
import Map from './Map.js'

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {show:false,origin:null};
        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.setState({origin:{name:'You',lat:position.coords.latitude,lng:position.coords.longitude}});
            },(error) => { 
                console.log(error); 
            },{timeout:3000});
    }

    checkOrigin() {
        if (this.state.origin === null) {
            alert('Turn Location Services on');
        } else {
            this.setState({show:!this.state.show})
        }
    }

    render() {
        return (
            <>
            {!this.state.show && 
                <Button className='finder' variant='dark' onClick={() => this.checkOrigin()}>
                    <h1>Find the Nearest Garbage Plate</h1>
                </Button>}
            {this.state.show && 
                <Map origin={this.state.origin} />}
            </>
        );
    }
}
export default App;