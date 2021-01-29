import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import TextChat from './textchat/TextChannel.js';
import ServerSidebar from '../ServerSidebar.js';

export default function GroupServer(props){
    
    const [mounted, setMounted] = useState(true);
    const [loading, setLoading] = useState(true);
    const [userAccess, setUserAccess] = useState(false);
    //Whenever props.computedMatch.params.textChannelId
    //is undefined, defaultTextChannelId is used
    const [defaultTextChannelId, setDefaultTextChannelId] = useState("");

    useEffect(() => {
        return function cleanup(){
            setMounted(false);
        }
    }, []);

    //Whenever a user switches to a different group server, change defaultTextChannelId to the 
    //first text channel of the group server
    useEffect(()=>{
        if (props.groupServers){
            setDefaultTextChannelId(props.groupServers[props.computedMatch.params.groupServerId].textChannels[0]);
        }
    }, [props.computedMatch.params.groupServerId]);

    //Upon intialization, verify that the user is authorized to be in the group server
    //If the user is not authorized, userAccess = false which redirects them to /dashboard
    useEffect(async ()=>{
        await verifyUser();
        if(userAccess){
        let lastTextChannels = {...props.lastTextChannels};
        lastTextChannels[props.computedMatch.params.groupServerId] = props.computedMatch.params.textChannelId ? props.computedMatch.params.textChannelId : defaultTextChannelId;
        props.setLastTextChannels({...lastTextChannels});
        }
    }, [props.computedMatch.params.textChannelId, props.computedMatch.params.groupServerId]);
    

    async function verifyUser(){
        if (props.user){
            try{
                await fetch('http://localhost:3000/api/groupServer/verify', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': localStorage.getItem('Authorization')
                    },
                    body: JSON.stringify({
                        type: 'verify',
                        userId: props.user._id,
                        groupServerId: props.computedMatch.params.groupServerId,
                        textChannelId: props.computedMatch.params.textChannelId ? props.computedMatch.params.textChannelId : defaultTextChannelId
                    })
                }).then(response => { return response.json(); })
                    .then((data) => {
                        if (mounted) setUserAccess(data.success);
                    })
            } finally{
                if (mounted) setLoading(false);
            }
        }
        else setUserAccess(false);
    }

    function sendMessage(content, timestamp, index){
        props.sendMessage(content, timestamp, index, props.computedMatch.params.groupServerId, props.computedMatch.params.textChannelId ? props.computedMatch.params.textChannelId : defaultTextChannelId);
    }

    return(
       <>
           {
               loading ?
               <p>Loading</p>
               :
                ((userAccess && props.textChannels[props.computedMatch.params.textChannelId ? props.computedMatch.params.textChannelId : defaultTextChannelId]) ? 
                (
                    <>
                        <div className="col-1" style={{minHeight: "100vh", background: "#292929"}}>
                            <ServerSidebar 
                            user={props.user} 
                            setUser={props.setUser} 
                            textChannels={props.textChannels}
                            setTextChannels={props.setTextChannels}
                            inviteCodes={props.inviteCodes}
                            setInviteCodes={props.setInviteCodes}
                            groupServers={props.groupServers} 
                            setGroupServers={props.setGroupServers}
                            groupServerId={props.computedMatch.params.groupServerId}
                            textChannelId={props.computedMatch.params.textChannelId ? props.computedMatch.params.textChannelId : defaultTextChannelId}
                            fetchServerListInfo={props.fetchServerListInfo}
                            />
                        </div>
                        <TextChat 
                        sendMessage={sendMessage} 
                        chatLog={
                            props.textChannels ? 
                            props.textChannels[props.computedMatch.params.textChannelId ? props.computedMatch.params.textChannelId : defaultTextChannelId].chatLog
                            : 
                            undefined
                            } 
                        user={props.user}/>
                    </>
                )
                :
                <Redirect to="/dashboard" />)
           }
       </>
    );
}