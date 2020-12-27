import React, { useState, useEffect } from 'react';
import Navbar from './Navbar.js';
import ChatDisplay from './ChatDisplay.js';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

export default function Chat(){
  const [messages, setMessages] = useState([]);
  const {currentUser} = useAuth();
  const ws = new WebSocket(("ws://localhost:1000"));

  useEffect(() => {
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

    //Add event listener whenever data is received
    //from WebSocket Server, add data to messages array state
    ws.onmessage = (data) => {
      const parsedData = JSON.parse(data.data);
      console.log(parsedData);
      setMessages(messages => [...messages, parsedData]);
    };
  }, []);

  const sendMessages = (content, timestamp) => {
    let data = {
      content: content, 
      id: (messages.length === 0 ? 1 : messages[messages.length-1].id + 1),
      author: currentUser.email,
      timestamp: timestamp
    };

    if (ws){
      ws.send(JSON.stringify(data));
      //Send the new message to the backend
      axios.post("http://localhost:3000/", data)
      .then(() => {}).
      catch(err => {
        console.error(err);
      });
    }
  };

  return (
    <div>
      <Navbar />
      <ChatDisplay sendMessages={sendMessages} messages={messages}/>
    </div>
  );
};