import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import TextChat from './textchat/TextChat.js';
import ServerSidebar from '../ServerSidebar.js';

export default function GroupServer(props){

<<<<<<< HEAD
    const [user, setUser] = useState(props.user);

    const userHasAccess = () => {
        let bool = false;
        console.log(props)
        user.servers.forEach((server) => {
            if (server.serverId === props.computedMatch.params.serverId){
                bool = true;
                return;
=======
    const [loading, setLoading] = useState(true);
    const [userAccess, setUserAccess] = useState(false);

    useEffect(async () => {
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
                        serverId: props.computedMatch.params.serverId
                    })
                }).then(response => { return response.json(); })
                    .then((data) => {
                        setUserAccess(data.success);
                    })
            } finally{
                setLoading(false);
>>>>>>> 47177db4f7aa31e71d595d0204bef91474c8ca0e
            }
        }
        else setUserAccess(false);
    }, []);

    return(
       <>
           {
               loading ?
               <p>Loading</p>
               :
                (userAccess ? 
                (
                    <>
                        <div className="col-1" style={{minHeight: "100vh", background: "#292929"}}>
                            <ServerSidebar 
                            user={props.user} 
                            setUser={props.setUser} 
                            servers={props.servers} 
                            setServers={props.setServers}
                            serverId={props.computedMatch.params.serverId}
                            fetchServerListInfo={props.fetchServerListInfo}
                            />
                        </div>
<<<<<<< HEAD
                        <TextChat serverId={props.computedMatch.params.serverId} user={user}/>
                    </div>
                </div> 
                :
                <Redirect to="/dashboard" />
=======
                        <TextChat serverId={props.computedMatch.params.serverId} user={props.user}/>
                    </>
                )
                :
                <Redirect to="/dashboard" />)
>>>>>>> 47177db4f7aa31e71d595d0204bef91474c8ca0e
           }
       </>
    );
}
