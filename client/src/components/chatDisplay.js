import React, { useState, useEffect } from 'react';
import ChatBox from './ChatBox.js';

const ChatDisplay = (props) => {
    const sendMessages = (content, timestamp) => {
        //Bubble up the data to Chat.js
        props.sendMessages(content, timestamp);
    }

   const displayChat = () => {
        //Display the messages array from Chat.js
        if (props.messages){
            return(
                <div>
                    {props.messages.map(message => (
                        <p className="ml-2" key={message.id}>{message.author} ({message.timestamp}):<br />{message.content}</p>
                    ))}
                </div>
            );
        }
    };

    return (
        <div>
            {displayChat()}
            <ChatBox sendMessages={sendMessages}/>
        </div>
    );
}

export default ChatDisplay;