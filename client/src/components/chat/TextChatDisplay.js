import React, { useState, useEffect } from 'react';
import TextChatBox from './TextChatBox.js';

export default function TextChatDisplay(props){
    const sendMessage = (content, timestamp) => {
        //Bubble up the data to Chat.js
        props.sendMessage(content, timestamp);
    }

   const displayChat = () => {
        //Display the messages array from Chat.js
        if (props.messages){
            return(
                <div>
                {
                    Object.entries(props.messages).map(([key, value]) => {
                        if (value.notSent)
                            return(<p className="ml-2 text-secondary" key={key}>{value.author} ({value.timestamp}):<br />{value.content}</p>)
                        else
                            return(<p className="ml-2" key={key}>{value.author} ({value.timestamp}):<br />{value.content}</p>)
                    })
                }
                </div>
            );
        }
    };
    /*
    {props.messages.map(message => (
                        <p className="ml-2" key={message.id}>{message.author} ({message.timestamp}):<br />{message.content}</p>
                    ))}
    */
    return (
        <div>
            {displayChat()}
            <TextChatBox sendMessage={sendMessage}/>
        </div>
    );
}