import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Popup from "./popups/Popup.js";
import CreateServerForm from "./popups/CreateServerForm.js";

export default function ServersList(props){

    const [openPopupCreate, setOpenPopupCreate] = useState(false);

    //Displays the group servers the user is a member of
    //Group Server name will be highlighted "#b5fff3" if the user is in that group server page
    function displayServers(){
        if (props.groupServers){
            return(
                <>
                {
                    Object.entries(props.groupServers).map(([key,value]) => {
                        if (value){
                            const textChannelId = Object.keys(value.textChannels)[0];
                            return(
                                <li key={key}>
                                    {
                                    props.groupServerId === key ?
                                    <Link onClick={(e) => e.preventDefault()} style={{color: "#b5fff3"}} to={{pathname: "/group/"+key+"/"+textChannelId}} >
                                        {value.name}
                                    </Link>
                                    :
                                    <Link className="text-reset" to={{pathname: "/group/"+key+"/"+textChannelId}} >
                                        {value.name}
                                    </Link>
                                    }
                                </li>
                            )
                        }
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
                    {displayServers()}
                    <li onClick = {() => {if(!openPopupCreate) setOpenPopupCreate(true)}}>
                    <Link className="text-reset" to="#">Create Server</Link>
                        <Popup
                        title={"Create New Server"}
                        openPopup = {openPopupCreate}
                        setOpenPopup = {setOpenPopupCreate}
                        >
                            <CreateServerForm 
                            user={props.user}
                            groupServers = {props.groupServers}
                            setGroupServers = {props.setGroupServers}
                            />
                        </Popup>
                    </li>
                </ul>
            </nav>
        </div>
    );
};