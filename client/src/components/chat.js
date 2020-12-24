import React, { useState, useEffect } from 'react';
import Navbar from './Navbar.js';
import ChatDisplay from './ChatDisplay.js';
import axios from 'axios';

export default function Chat(){
  const [messages, setMessages] = useState([]);

  //useEffect only runs once in the initial render
  useEffect(() => {
    //Make a request to the backend
    axios.get("/getChatLogs").then(response => {
      //If data from backend exists
      //Update the messages array state
      if (response.data){
        let _messages = [...messages];
        for (let i = 0; i < response.data.length; i++){
          _messages.push(response.data[i]);
        }
        setMessages(_messages);
      }
    });
  }, []);

  const updateMessages = (input, timestamp) => {
    ////First clone the messages array state
    let _messages = [...messages];
    let message;

    //If this is the first message then create the first message
    //and push it into the messages array
    if (_messages.length === 0){
      message = {input: input, id: 1, author: "Stephen", timestamp: timestamp};
      _messages.push(message);
    }

    //Otherwise use the last element of the messages array 
    //to create a new id
    else{
      message = {input: input, id: messages[messages.length-1].id + 1, author: "Stephen", timestamp: timestamp};
      _messages.push(message);
    }

    //Set the new messages array state
    setMessages(_messages);

    //Send the new message to the backend
    axios.post("http://localhost:3000/", message)
    .then(() => {}).
    catch(err => {
      console.error(err);
    });
  };

  return (
    <div>
      <Navbar />
      <ChatDisplay updateMessages={updateMessages} messages={messages}/>
    </div>
  );
};