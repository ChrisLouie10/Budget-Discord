import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import Popup from "./popups/Popup.js";
import CreateServerForm from "./popups/CreateServerForm.js";

export default function ServersList(props){

    const [mounted, setMounted] = useState(true);
    const [openPopupCreate, setOpenPopupCreate] = useState(false);
    
    useEffect(() => {
        return function cleanup(){
            setMounted(false);
        }
    }, []);

    function displayServers(){
        if (props.servers){
            return(
                <>
                {
                    Object.entries(props.servers).map(([key,value]) => {
                        return(
                            <li key={key}>
                                <Link className="text-reset" to={{pathname: "/group/"+key}} >
                                    {value.name}
                                </Link>
                            </li>
                        )
                    })
                }
                </>
            );
        }
    }

    return (
        <div className="wrapper w-100">
            <nav id="sidebar">
                <div>
                    <h5 className="text-white">Budget-Discord</h5>
                </div>

                <ul className="list-unstyled text-white">
                    <li>
                        <Link className="text-reset" to="/dashboard">Dashboard</Link>
                    </li>
                    <li>
                        <Link className="text-reset" to="/friends">Friends</Link>
                    </li>
                    <li>
                        <Link className="text-reset" to="/update-profile">Update Profile</Link>
                    </li>
                    {displayServers()}
                    <li onClick = {() => {if(!openPopupCreate) setOpenPopupCreate(true)}}>
                    <Link className="text-reset" to="#">Create Server</Link>
                        <Popup
                        title={"Create New Server"}
                        openPopup = {openPopupCreate}
                        setOpenPopup = {setOpenPopupCreate}
                        user = {props.user}
                        fetchServerListInfo = {props.fetchServerListInfo}>
                            <CreateServerForm mounted={mounted}/>
                        </Popup>
                    </li>
                </ul>
            </nav>
        </div>
    );
};