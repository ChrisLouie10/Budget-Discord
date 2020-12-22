import React, { Component } from 'react';

class ChatBox extends Component {
    state = { 
        input: ""
     };

    //When Enter key is pressed on the input,
    //the value of the input is sent to ChatDisplay
    //and the input is cleared
    handleEnterPress = (e) => {
        if (e.key == "Enter"){
            //Send the new message to chatDisplay.jsx
            const timestamp = new Date();
            console.log(timestamp.toString());
            this.props.updateMessages(e.target.value, timestamp.toString());
            this.setState({input: ""});  
        }
    };

    handleInputChange = (e) => {
        this.setState({input: e.target.value});
    };

    render() { 
        return (  
            <input type="text" className="form-control m-2" id="chatBox" value={this.state.input} onChange={this.handleInputChange} onKeyPress={this.handleEnterPress}/>
        );
    }
}
 
export default ChatBox;