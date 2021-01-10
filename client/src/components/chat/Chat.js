import React, { useState, useEffect, useRef } from 'react';
import ChatDisplay from './ChatDisplay.js';
import { propTypes } from 'react-bootstrap/esm/Image';

const ws = new WebSocket("ws://localhost:1000");

const Chat = ({match, location}) => {
  const [messages, setMessages] = useState([]);
  let serverName = "Chat Group " + match.params.serverId;
  const initialization = useRef(true);

  useEffect(() => {
    if (initialization.current){
      initialization.current = false;

      //Send a request to websocket server (wss) for the relevant chat log
      const data = {
        type: "chatLog",
        serverId: match.params.serverId
      };
      waitForWSConnection(() => {
        ws.send(JSON.stringify(data))
      }, 100);
  
      //Add an event listener whenever a message is received from wss
      ws.onmessage = (message) => {
        let parsedMessage;
        try{
          parsedMessage = JSON.parse(message.data);
        } catch (e) {
          console.log("Message from wss could not be parsed!", message);
          return;
        }
  
        if (parsedMessage.type === "chatLog"){
          parsedMessage.chatLog.forEach((message) => {
            setMessages(messages => [...messages, message]);
          });
        }
        else if (parsedMessage.type === "message"){
          setMessages(messages => [...messages, parsedMessage.message]);
        }
      };
    }
    else{
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
    }
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

  const sendMessage = (content, timestamp) => {
    const message = {
      content: content, 
      id: (messages.length === 0 ? 1 : messages[messages.length-1].id + 1),
      author: currentUser.email,
      timestamp: timestamp
    };
    const data = {
      type: "message",
      serverId: match.params.serverId,
      message: message
    };

    setMessages(messages => [...messages, message]);

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