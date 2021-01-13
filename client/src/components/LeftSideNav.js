import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Popup from "./popups/Popup.js";
import CreateServerForm from "./popups/CreateServerForm.js";
//const jwt = require('jsonwebtoken');

export default function LeftSideNav(props){

    const [openPopup, setOpenPopup] = useState(false);
    //const [user, setUser] = useState(jwt.verify(localStorage.getItem('access-token'), process.env.REACT_APP_SECRET_ACCESS_TOKEN));
    
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
                        props.user.user.servers.map((server) => (
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
                        user = {props.user}
                        setUser = {props.setUser}>
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