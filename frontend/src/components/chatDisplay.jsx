import React, { Component } from 'react';
import ChatBox from './chatBox.jsx';

class ChatDisplay extends Component {
    updateMessages = (input, timestamp) => {
        //Update the messages array from App.js
        this.props.updateMessages(input, timestamp);
    }

    displayChat = () => {
        //Display the messages array from App.js
        if (this.props.messages){
            return(
                <div>
                    {this.props.messages.map(message => (
                        <p className="ml-2" key={message.id}>{message.author} ({message.timestamp}):<br />{message.input}</p>
                    ))}
                </div>
            );
        }
    };

    render() { 
        return (
            <div>
                {this.displayChat()}
                <ChatBox updateMessages={this.updateMessages}/>
            </div>
        );
    }
}
 
export default ChatDisplay;