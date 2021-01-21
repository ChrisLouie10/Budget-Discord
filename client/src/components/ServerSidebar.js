import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import Popup from "./popups/Popup.js";
import InviteForm from "./popups/InviteForm.js"

export default function ServersList(props){

    const [mounted, setMounted] = useState(true);
    const [serverName, setServerName] = useState("GroupServer");
    const [inviteCode, setInviteCode] = useState();
    const [matchingInviteCode, setMatchingInviteCode] = useState(false);
    const [openPopupInvite, setOpenPopupInvite] = useState(false);
    const [error, setError] = useState("");
    const history = useHistory();
    const controller = new AbortController();
    const { signal } = controller;
    
    useEffect(()=>{
        return function cleanup(){
            controller.abort();
            setMounted(false);
        }
    }, []);

    useEffect(() => {
        if (props.servers){
            setServerName(props.servers[props.serverId].name);
        }
        setMatchingInviteCode(false);
    }, [props.serverId]);

    useEffect(getCurrentInviteCode, [props.servers, matchingInviteCode]);

    async function deleteCurrentServer(e){
        e.preventDefault();

        if (props.serverId){
            await fetch('http://localhost:3000/api/groupServer/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('Authorization')
                },
                body: JSON.stringify({
                    type: "delete",
                    serverId: props.serverId,
                    userId: props.user._id
                }),
                signal
            }).then(response => { return response.json(); })
                .then((data) => {
                    if (!data.success) setError(data.message);
                    else {
                        props.fetchServerListInfo();
                        history.push("/dashboard");
                    }
            });
        }
    }

    function getCurrentInviteCode(){
        if (!matchingInviteCode && props.servers){
            Object.entries(props.servers).map(([key, value]) => {
                if (key === props.serverId){
                    setMatchingInviteCode(true);
                    if (value.invite)
                        setInviteCode(value.invite.code);
                    return;
                }
            });
        }
    }

    return (
            <nav id="server-side-bar">
                <div className="row">
                    <h5 className="text-white">{serverName}</h5>
                </div>
                <div className="row">
                    <ul className="list-unstyled text-white">
                    {
                        (props.servers[props.serverId].owner ||
                            props.servers[props.serverId].admin) ?
                        <li onClick = {() => {if(!openPopupInvite) setOpenPopupInvite(true)}}>
                            <Link className="text-reset" to="#">Invite People</Link>
                            <Popup
                            title={"Invite"}
                            openPopup = {openPopupInvite}
                            setOpenPopup = {setOpenPopupInvite}
                            user = {props.user}
                            servers = {props.servers}
                            setServers = {props.setServers}
                            serverId = {props.serverId}
                            inviteCode = {inviteCode}
                            setInviteCode = {setInviteCode}>
                                <InviteForm mounted={mounted}/>
                            </Popup>
                        </li>
                        :
                        <></>
                    }
                    {
                        props.servers[props.serverId].owner ?
                        <li onClick = {deleteCurrentServer}>
                            <Link className="text-reset" to="#">Delete Current Server</Link>
                        </li>
                        :
                        <></>
                    }
                    </ul>
                </div>
            </nav>
    );
};