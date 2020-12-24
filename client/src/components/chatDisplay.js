import React, { useState, useEffect } from 'react';
import ChatBox from './chatBox.jsx';

const ChatDisplay = (props) => {
    const updateMessages = (input, timestamp) => {
        //Bubble up the data to App.js
        props.updateMessages(input, timestamp);
    }

    const displayChat = () => {
        //Display the messages array from App.js
        if (props.messages){
            return(
                <div>
                    {props.messages.map(message => (
                        <p className="ml-2" key={message.id}>{message.author} ({message.timestamp}):<br />{message.input}</p>
                    ))}
                </div>
            );
        }
    };

    return (
        <div>
            {displayChat()}
            <ChatBox updateMessages={updateMessages}/>
        </div>
    );
}
 
export default ChatDisplay;