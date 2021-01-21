import React, { useState, useEffect, useRef } from 'react';
import TextChatDisplay from './TextChatDisplay.js';
const ws = new WebSocket("ws://localhost:1000");

//WIP - Change messages state from array to dictionary!
export default function TextChat(props){
  
  const [mounted, setMounted] = useState(true);
  const [messages, _setMessages] = useState({});
  const messagesRef = useRef(messages);
  const setMessages = (data) => {
    messagesRef.current = data;
    _setMessages(data);
  };
  const initialization = useRef(true);

  const handleMessage = (message) => {
    if (mounted){
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
          _messages[message.index] = message;
          delete _messages[message.index].index;
        });
        setMessages({..._messages});
      }
      else if (parsedMessage.type === "message"){
        let newMessage = {...messagesRef.current};
        newMessage[parsedMessage.message.index] = parsedMessage.message;
        setMessages({...newMessage});
      }
    }
  }

  useEffect(() => {
    if (ws)
      ws.addEventListener('message', handleMessage);
    return function cleanup(){
      setMounted(false);
    }
  }, []);

  useEffect(() => {
    //Whenever "chatroom" is switched, send a new request to wss for
    //the relevant chat log
    if (mounted){
      setMessages(messages => []);
      const data = {
        type: "chatLog",
        serverId: props.serverId
      };
      waitForWSConnection(() => {
        ws.send(JSON.stringify(data))
      }, 100);
    }
  }, [props.serverId]);

  const waitForWSConnection = (callback, interval) => {
    if(ws){
      if (ws.readyState === WebSocket.OPEN){
        callback();
      }
      else{
        setTimeout(() => {
          waitForWSConnection(callback, interval);
        }, interval);
      }
    }
  };

  const sendMessage = (content, timestamp) => {
<<<<<<< HEAD
    const message = {
      content: content, 
      id: (Object.keys(messages).length + 1),
      author: props.user.name,
      timestamp: timestamp,
      notSent: true
    };
    const data = {
      type: "message",
      serverId: props.serverId,
      message: message
    };
=======
    if (mounted){
      const message = {
        content: content, 
        index: (Object.keys(messages).length + 1),
        author: props.user.name,
        timestamp: timestamp,
        notSent: true
      };
      const data = {
        type: "message",
        serverId: props.serverId,
        message: message
      };
>>>>>>> 47177db4f7aa31e71d595d0204bef91474c8ca0e

      let newMessage = {};
      newMessage[message.index] = message;
      setMessages({...messages, ...newMessage});

      waitForWSConnection(()=>{
        ws.send(JSON.stringify(data));
      }, 100);
    }
  };


  return (
    <TextChatDisplay sendMessage={sendMessage} messages={messages}/>
  );
};