import React, { useState, useEffect, useRef } from 'react';
import { Redirect, Route } from 'react-router-dom';
import GroupServer from '../groupserver/GroupServer.js';
import ServersList from '../ServersList.js';
import Loading from './Loading';
const ws = new WebSocket("ws://localhost:1000");

// Component creating a private route
export default function PrivateRoute({ component: Component, ...rest}) {

  const controller = new AbortController();
  const { signal } = controller;
  const [ user, setUser ] = useState();
  const [ success, setSuccess ] = useState(false);
  const [ loading, setLoading ] = useState(true);
  const [ mounted, setMounted] = useState(true);
  const [ error, setError] = useState("");

  //key: groupServerId, value: properties (name, textChannelId's)
  const [ groupServers, setGroupServers ] = useState({});
  //key: textChannelId, value: properties (name, groupServerId, chatLog)
  const [ textChannels, _setTextChannels ] = useState({});
  //key: groupServerId, value: inviteCode
  const [ inviteCodes, setInviteCodes ] = useState({});
  //Used to "remember" which text channel a user leaves off of in
  //a group server
  //key: groupServerId, value: textChannelId
  const [lastTextChannels, setLastTextChannels] = useState({});

  const textChannelsRef = useRef(textChannels);
  const setTextChannels = (data) => {
    textChannelsRef.current = data;
    _setTextChannels(data);
  }

  useEffect(()=>{
    console.log("group", groupServers);
    console.log("text", textChannels);
  }, [groupServers, textChannels]);

  //On initialization, set up websocket and verify
  //user log-in. Then fetch the verified user's
  //group server list information to update
  //groupServers, textChannels, and inviteCodes states
  useEffect(async () => {
    if (ws){
      ws.addEventListener('message', handleWSSMessage);
    }

    let user;

    await fetch('http://localhost:3000/api/user/verify', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('Authorization')
      },
    }).then(response => { if(mounted) return response.json() })
      .then((data) => { 
        if(mounted){
          user = data.user;
          setUser(data.user);
          setSuccess(data.success);
        }
    }).catch(error => (mounted ? setSuccess(false): null));

    await fetchServerListInfo(true, true, user);
    setLoading(false);
    return () => {
      setMounted(false);
      controller.abort();
    }
  }, [])

  async function fetchServerListInfo(getTextChannels = false, getInviteCodes = true, _user = undefined){
    await fetch('http://localhost:3000/api/groupServer/find', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('Authorization')
        },
        body: JSON.stringify({
            type: "find",
            userId: _user ? _user._id : (user ? user._id : undefined),
            getTextChannels: getTextChannels,
            getInviteCodes: getInviteCodes
        }),
        signal
    }).then(response => { return response.json(); })
        .then((data) => {
          if (!data.success) setError(data.message);
          else {
            setGroupServers({...data.servers});  
            if (getTextChannels) {
              setTextChannels({...data.textChannels});
            }
            if (getInviteCodes) {
              setInviteCodes({...data.inviteCodes});
            }
          }       
        });
  }

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

  function handleWSSMessage(message){
    if (mounted){
      let parsedMessage;
      try{
          parsedMessage = JSON.parse(message.data);
      } catch(e){
          console.log("Message from wss could not be parsed!", message);
          return;
      }
      if (parsedMessage.type === "message"){
        let _textChannels = {...textChannelsRef.current};
        console.log("MESSAGE:", _textChannels);
        _textChannels[parsedMessage.textChannelId].chatLog[_textChannels[parsedMessage.textChannelId].chatLog.length - 1] = parsedMessage.message;
        setTextChannels({..._textChannels});
      }
    }
  }

  function sendMessage(content, timestamp, index, groupServerId, textChannelId){
    if (mounted){
      const message = {
        content: content, 
        index: index + 1,
        author: user.name,
        timestamp: timestamp,
        notSent: true
      };
      const data = {
        type: "message",
        textChannelId: textChannelId,
        serverId: groupServerId,
        message: message
      };
  
      let _textChannels = {...textChannels};
      _textChannels[textChannelId].chatLog.push(message);
      setTextChannels({..._textChannels});
  
      waitForWSConnection(()=>{
        ws.send(JSON.stringify(data));
      }, 100);
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
                lastTextChannels={lastTextChannels}
                servers={groupServers}
                fetchServerListInfo={fetchServerListInfo}/>
            </div>
            <Component
              {...rest} 
              textChannels={(Component === GroupServer) ? textChannels : undefined}
              setTextChannels={(Component === GroupServer) ? setTextChannels : undefined}
              inviteCodes={(Component === GroupServer) ? inviteCodes : undefined}
              setInviteCodes={(Component === GroupServer) ? setInviteCodes : undefined}
              sendMessage={(Component === GroupServer) ? sendMessage : undefined}
              lastTextChannels={(Component === GroupServer) ? lastTextChannels : undefined}
              setLastTextChannels={(Component === GroupServer) ? setLastTextChannels : undefined}
              user={user} 
              setUser={setUser} 
              groupServers={groupServers} 
              setGroupServers={setGroupServers}
              fetchServerListInfo={fetchServerListInfo}
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
