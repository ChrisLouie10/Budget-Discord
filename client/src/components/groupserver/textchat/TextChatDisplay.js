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
                <div className="row">

                <div className="col-12" aria-orientation="vertical" style={{height: "100%", position: "absolute", overflowY: "scroll"}}>

                {
                    Object.entries(props.messages).map(([key, value]) => {
                        if (value.notSent)
                            return(
                                <p className="ml-2 #858585" key={key}>
                                     {value.author} ({value.timestamp}):<br />{value.content}
                                </p>);
                        else
                            return(
                                <p className="ml-2" style={{color: "#c2c2c2"}} key={key}>
                                    {value.author} ({value.timestamp}):<br />{value.content}
                                </p>);
                    })
                }
                </div>
                </div>
            );
        }
    };
    return (
        <div className="col-11 align-self-end w-100" style={{minHeight: "100vh", background: "#303030"}}>
            {displayChat()}
            <TextChatBox sendMessage={sendMessage}/>
        </div>
    );
}