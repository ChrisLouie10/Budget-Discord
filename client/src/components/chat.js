import React, { useState, useEffect } from 'react';
import ChatDisplay from './ChatDisplay.js';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

export default function Chat(){
  const [messages, setMessages] = useState([]);
  const {currentUser} = useAuth();
  const ws = new WebSocket(("ws://localhost:1000"));

  useEffect(() => {
    ws.onopen = () => {
      ws.send("requesting chat log");
    }

    //Add event listener whenever data is received
    //from WebSocket Server, add data to messages array state
    ws.onmessage = (data) => {
      try {
        const parsedData = JSON.parse(data.data);
        if (Array.isArray(parsedData)){
          parsedData.forEach(data => {
            setMessages(messages => [...messages, data]);
          });
        }
        else{
          setMessages(messages => [...messages, parsedData]);
        }
        
      } catch (e) {
        console.log("failed to parse data received from websocket server: ", data);
      }
    };
  }, []);

  const sendMessage = (content, timestamp) => {
    let data = {
      content: content, 
      id: (messages.length === 0 ? 1 : messages[messages.length-1].id + 1),
      author: currentUser.email,
      timestamp: timestamp
    };

    //setMessages(messages => [...messages, data]);

    if (ws){
      ws.send(JSON.stringify(data));
    }
  };

  return (
    <div>
      <ChatDisplay sendMessage={sendMessage} messages={messages}/>
    </div>
  );
};