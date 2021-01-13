import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import LeftSideNav from '../LeftSideNav.js';
import TextChat from './textchat/TextChat.js';
const jwt = require('jsonwebtoken');

export default function GroupServer(props){

    const [user, setUser] = useState(props.user);

    const userHasAccess = () => {
        let bool = false;
        user.servers.forEach((server) => {
            if (server.serverId === props.computedMatch.params.serverId){
                bool = true;
                return;
            }
        });
        return bool;
    }

    return(
       <div>
           {
                userHasAccess() ? 
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-1" style={{minHeight: "100vh", background: "#212121"}}>
                            <LeftSideNav user={user} setUser={setUser}/>
                        </div>
                        <TextChat serverId={props.computedMatch.params.serverId} user={user}/>
                    </div>
                </div> 
                :
                <Redirect to="/dashboard" />
           }
       </div>
    );
}
