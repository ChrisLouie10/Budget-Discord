import React, { useState, useEffect, useRef } from 'react';
import { Redirect, Route } from 'react-router-dom';
import GroupServer from '../groupserver/GroupServer.js';
import JoinGroupServer from '../groupserver/JoinGroupServer.js'
import ServersList from '../ServersList.js';
import Loading from './Loading';

let ws;

// Component creating a private route
export default function PrivateRoute({ component: Component, ...rest}) {

  const controller = new AbortController();
  const {signal} = controller;
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(true);
  const [uri, setUri] = useState(cleanUpURI(window.location.href));
  const [groupServers, setGroupServers] = useState({});

  const [user, _setUser] = useState();
  const userRef = useRef(user);
  const setUser = async (data) => {
    userRef.current = data;
    _setUser(data);
  }

  const [chatLogs, _setChatLogs] = useState({});
  const chatLogsRef = useRef(chatLogs);
  const setChatLogs = (data) => {
    chatLogsRef.current = data;
    _setChatLogs(data);
  };

  useEffect(async () => {
    //ws = new WebSocket("wss://budget-discord-server.herokuapp.com/");
    ws = new WebSocket(process.env.REACT_APP_wssURI);

    //Set up websocket
    if (ws){
      ws.addEventListener('message', handleWSSMessage);
    }

    //Verify user
    await fetch("/api/user/verify", {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('Authorization')
      },
    }).then(response => { if(mounted) return response.json() })
      .then((data) => { 
        if(mounted){
          setUser(data.user);
          setSuccess(data.success);
        }
        if (!data.success) console.log(data.message);
    }).catch(error => (mounted ? setSuccess(false): null));

    //Populate groupServers state
    if (userRef.current){
      await fetch("/api/groupServer/find", {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': localStorage.getItem('Authorization')
          },
          body: JSON.stringify({
              type: "find",
              userId: userRef.current._id
          }),
          signal
      }).then(response => { if(mounted) return response.json(); })
        .then((data) => {
          if (data.success) setGroupServers({...data.groupServers});     
          else console.log(data.message); 
      });
    }

    setLoading(false);

    return () => {
      setMounted(false);
      controller.abort();
    }
  }, [])

  // Repeatedly attempts to contact ws server with "callback" until ws server is online
  function waitForWSConnection(callback, interval){
    if(ws){
      if (ws.readyState === WebSocket.OPEN) callback();
      else{
        setTimeout(() => {
          waitForWSConnection(callback, interval);
        }, interval);
      }
    }
  }

  // Looks for the 3rd "/" and removes every character after it.
  // i.e http://localhost:3000/dashboard
  // becomes http://localhost:3000
  function cleanUpURI(_uri){
    let dashes = 0;
    for(let i = 0; i < _uri.length; i++){
      if (_uri[i] == '/'){
        dashes++;
      }
      if (dashes === 3){
        _uri = _uri.substring(0, i);
        break;
      }
    }
    return _uri;
  }

  function handleWSSMessage(message){
    if (mounted){
      let parsedMessage;
      try{
          parsedMessage = JSON.parse(message.data);
      } catch(e){
          console.log("Message from wss could not be parsed!", message);
          return;
      }

      //Check whether message from ws server is valid
      if (parsedMessage.type === "duplicateMessage"){
        let _chatLogs = {...chatLogsRef.current};
        const index = _chatLogs[parsedMessage.textChannelId].length - 1;
        _chatLogs[parsedMessage.textChannelId][index] = parsedMessage.message;
        setChatLogs({..._chatLogs});
      }
      else if (parsedMessage.type === "message"){
        let _chatLogs = {...chatLogsRef.current};
        _chatLogs[parsedMessage.textChannelId].push(parsedMessage.message);
        setChatLogs({..._chatLogs});
      }
    }
  }

  function sendMessage(message, groupServerId, textChannelId){
    if (mounted){
      //Create data 
      const data = {
        type: "message",
        textChannelId: textChannelId,
        serverId: groupServerId,
        message: message
      };
      //Send data over to ws server
      waitForWSConnection(()=>{
        ws.send(JSON.stringify(data));
      }, 500);
    }
  }

  if(!loading) return (
    <div className="container-fluid">
      <div className="row">
      <Route
        {...rest}
        render={(props) =>{
          return (success) ? 
          <>
            <div className="col-1" style={{minHeight: "100vh", background: "#212121"}}>
              <ServersList 
                user={user} 
                setUser={setUser} 
                groupServerId={rest.computedMatch.params.groupServerId}
                groupServers={groupServers}
                setGroupServers={setGroupServers}/>
            </div>
            <Component
              {...rest} 
              groupServers={(Component === GroupServer || Component === JoinGroupServer) ? groupServers : undefined} 
              setGroupServers={(Component === GroupServer || Component === JoinGroupServer) ? setGroupServers : undefined}
              chatLogs={(Component === GroupServer) ? chatLogs : undefined}
              setChatLogs={(Component === GroupServer) ? setChatLogs : undefined}
              sendMessage={(Component === GroupServer) ? sendMessage : undefined}
              uri={uri}
              user={user} 
              setUser={setUser}
              props={props}/> 
          </>
          : 
          <Redirect to="/login" />;
        }}
      ></Route>
      </div>
    </div>
  );
  else{
    return <Loading/>
  }
}
