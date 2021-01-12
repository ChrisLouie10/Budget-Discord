import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Popup from "./Popup.js";
import CreateServerForm from "./CreateServerForm.js";
//import "./LeftSideNav.css";
const jwt = require('jsonwebtoken');

export default function LeftSideNav(props){

    const [openPopup, setOpenPopup] = useState(false);
    const [user, setUser] = useState(jwt.verify(localStorage.getItem('access-token'), process.env.REACT_APP_SECRET_ACCESS_TOKEN));
    
    useEffect(() => {
        console.log(user.user);
    }, []);

    return (
        <div className="wrapper w-100">
            <nav id="sidebar">
                <div>
                    <h5 className="text-white">Budget-Discord</h5>
                </div>

                <ul className="list-unstyled text-white">
                    <li>
                        <Link className="text-reset" to="/">Dashboard</Link>
                    </li>
                    <li>
                        <Link className="text-reset" to="/update-profile">Update Profile</Link>
                    </li>
                    {
                        user.user.servers.map((server) => (
                            <li key={server.serverId}>
                                <Link className="text-reset" to={{pathname: "/group/"+server.serverId}} >
                                    {server.serverName}
                                </Link>
                            </li>
                        ))}
                    <li onClick = {() => {if (!openPopup)setOpenPopup(true)}}>
                        Create Server
                        <Popup
                        openPopup = {openPopup}
                        setOpenPopup = {setOpenPopup}
                        user = {user}
                        setUser = {setUser}>
                            <CreateServerForm />
                        </Popup>
                    </li>
                </ul>
            </nav>

            <div id="content">

            </div>
        </div>
    );
};
/*
<li>
    <Link to={{pathname: "/chat/1"}}>Chat Room 1</Link>
</li>
<li>
    <Link to={{pathname: "/chat/2"}}>Chat Room 2</Link>
</li>
<li>
    <Link to={{pathname: "/chat/3"}}>Chat Room 3</Link>
</li>
<li>
    <Link to={{pathname: "/chat/4"}}>Chat Room 4</Link>
</li>
*/