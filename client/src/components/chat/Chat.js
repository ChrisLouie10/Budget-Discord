import React, { useState, useEffect, useRef } from 'react';
import ChatDisplay from './ChatDisplay.js';
import { propTypes } from 'react-bootstrap/esm/Image';
const jwt = require('jsonwebtoken');
const ws = new WebSocket("ws://localhost:1000");

//WIP - Change messages state from array to dictionary!
const Chat = ({match, location}) => {
  const [messages, _setMessages] = useState({});
  const messagesRef = useRef(messages);
  const setMessages = (data) => {
    messagesRef.current = data;
    _setMessages(data);
  };
  const [user, setUser] = useState(jwt.verify(localStorage.getItem('access-token'), process.env.REACT_APP_SECRET_ACCESS_TOKEN));
  let serverName = "Chat Group " + match.params.serverId;
  const initialization = useRef(true);

  useEffect(() => {
    ws.addEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    //Whenever "chatroom" is switched, send a new request to wss for
    //the relevant chat log
    setMessages(messages => []);
    const data = {
      type: "chatLog",
      serverId: match.params.serverId
    };
    waitForWSConnection(() => {
      ws.send(JSON.stringify(data))
    }, 100);
  }, [match.params.serverId]);

  const waitForWSConnection = (callback, interval) => {
    if (ws.readyState === WebSocket.OPEN){
      callback();
    }
    else{
      setTimeout(() => {
        waitForWSConnection(callback, interval);
      }, interval);
    }
  };

  const handleMessage = (message) => {
    let parsedMessage;
    try{
      parsedMessage = JSON.parse(message.data);
    } catch (e) {
      console.log("Message from wss could not be parsed!", message);
      return;
    }

    if (parsedMessage.type === "chatLog"){
      let _messages = {};
      parsedMessage.chatLog.forEach((message) => {
        _messages[message.id] = message;
        delete _messages[message.id].id;
      });
      setMessages({..._messages});
    }
    else if (parsedMessage.type === "message"){
      let newMessage = {...messagesRef.current};
      newMessage[parsedMessage.message.id] = parsedMessage.message;
      setMessages({...newMessage});
    }
  }

  const sendMessage = (content, timestamp) => {
    const message = {
      content: content, 
      id: (Object.keys(messages).length + 1),
      author: user.user.name,
      timestamp: timestamp,
      notSent: true
    };
    const data = {
      type: "message",
      serverId: match.params.serverId,
      message: message
    };

    let newMessage = {};
    newMessage[message.id] = message;
    setMessages({...messages, ...newMessage});

    waitForWSConnection(()=>{
      ws.send(JSON.stringify(data));
    }, 100);
  };

  return (
    <div>
      <ChatDisplay sendMessage={sendMessage} messages={messages}/>
    </div>
  );
};

export default Chat;