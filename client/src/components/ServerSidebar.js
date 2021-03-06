import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import RightClickMenu from "./popups/RightClickMenu.js";
import Actions from "./popups/Actions.js";

export default function ServersList(props){

    const [mounted, setMounted] = useState(true);
    const [groupServerName, setGroupServerName] = useState("Group Server");
    const [actionDialog, setActionDialog] = useState(0);
    const [openPopupActions, setOpenPopupActions] = useState(false);

    useEffect(()=>{
        return function cleanup(){
            setMounted(false);
        }
    }, []);

    useEffect(() => {
        if (props.groupServers){
            setGroupServerName(props.groupServers[props.groupServerId].name);
        }
    }, [props.groupServerId]);

    function handleRightClick(e){
        if (e.nativeEvent.which === 3 || e.type === "contextmenu"){
            e.preventDefault();
        }
    };

    function displayTextChannels(){
        if (props.groupServers[props.groupServerId]){ 
            return(
                <>
                {
                    Object.entries(props.groupServers[props.groupServerId].textChannels).map(([key, value]) => {
                        return(
                            <li key={key}>
                            {
                                props.textChannelId === key ?
                                <Link style={{color: "#b5fff3"}} onContextMenu={handleRightClick} to={{pathname: "/group/"+props.groupServerId+"/"+key}}>
                                    {value.name}

                                </Link>
                                :
                                <Link className="text-reset" onContextMenu={handleRightClick} to={{pathname: "/group/"+props.groupServerId+"/"+key}}>
                                    {value.name}

                                </Link>
                            }
                            </li>
                        )
                    })
                }
                </>
            )
        }
    }

    return (
            <nav id="server-side-bar">
                <div className="row">
                    <h5 className="text-white">{groupServerName}</h5>
                </div>
                <div className="row">
                    <ul className="list-unstyled text-white">
                    <li onClick = {() => {if(!openPopupActions) {setOpenPopupActions(true); setActionDialog(0);}}}>
                        <Link className="text-reset" to="#">Actions</Link>  
                            <Actions
                                uri={props.uri}
                                mounted={mounted}
                                openPopup={openPopupActions}
                                setOpenPopup={setOpenPopupActions}
                                actionDialog={actionDialog}
                                setActionDialog={setActionDialog}
                                user = {props.user}
                                setUser = {props.setUser}
                                groupServerName = {groupServerName}
                                groupServers = {props.groupServers}
                                setGroupServers = {props.setGroupServers}
                                groupServerId = {props.groupServerId}
                                textChannelId = {props.textChannelId}
                                />
                    </li>
                    {displayTextChannels()}
                    </ul>
                </div>
            </nav>
    );
};