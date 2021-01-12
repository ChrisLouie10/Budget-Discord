import React, { useState } from 'react';
import LeftSideNav from './LeftSideNav.js';
import TextChat from './chat/TextChat.js';
const jwt = require('jsonwebtoken');

export default function GroupServer({match, location}){

    const [user, setUser] = useState(jwt.verify(localStorage.getItem('access-token'), process.env.REACT_APP_SECRET_ACCESS_TOKEN));

    return(
       <div className="container-fluid">
            <div className="row">
                <div className="col-1 bg-dark" style={{minHeight: "100vh"}}>
                    <LeftSideNav />
                </div>
                <div className="col-11 my-auto w-100">
                    <TextChat serverId={match.params.serverId} userName={user.user.name}/>
                </div>
            </div>
       </div> 
    );
}