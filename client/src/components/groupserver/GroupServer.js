import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import LeftSideNav from '../LeftSideNav.js';
import TextChat from './textchat/TextChat.js';
const jwt = require('jsonwebtoken');

export default function GroupServer({match}){

    const [user, setUser] = useState(jwt.verify(localStorage.getItem('access-token'), process.env.REACT_APP_SECRET_ACCESS_TOKEN));

    const userHasAccess = () => {
        let bool = false;
        user.user.servers.forEach((server) => {
            if (server.serverId === match.params.serverId){
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
                        <TextChat serverId={match.params.serverId} user={user}/>
                    </div>
                </div> 
                :
                <Redirect to="/" />
           }
       </div>
    );
}
