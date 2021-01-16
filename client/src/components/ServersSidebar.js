import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import Popup from "./popups/Popup.js";
import CreateServerForm from "./popups/CreateServerForm.js";

export default function ServersSidebar(props){

    const controller = new AbortController();
    const { signal } = controller;
    const [mounted, setMounted] = useState(true);
    const [servers, setServers] = useState([]);
    const [openPopup, setOpenPopup] = useState(false);
    const [error, setError] = useState("");
    const history = useHistory();

    useEffect(()=>{
        return function cleanup(){
            controller.abort();
            setMounted(false);
        }
    }, []);

    useEffect(()=> {
        fetchServerListInfo();
    }, [props.user.servers]);

    async function fetchServerListInfo(){
        try{
            await fetch('http://localhost:3000/api/groupServer/find', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('Authorization')
                },
                body: JSON.stringify({
                    type: "find",
                    serverIds: props.user.servers
                }), 
                signal
            }).then(response => { return response.json(); })
                .then((data) => {
                    if (!data.success) setError(data.message);
                    else if (mounted) setServers(data.servers);     
                });
        }finally {
        }
    }

    async function deleteCurrentServer(e){
        e.preventDefault();

        if (props.serverId){
            try{
                fetch('http://localhost:3000/api/groupServer/delete', {
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
                            fetchServerListInfo();
                            history.push("/dashboard");
                        }
                    });
            }finally{
            }
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
                        <Link className="text-reset" to="/update-profile">Update Profile</Link>
                    </li>
                    {
                        servers.map((server) => (
                            <li key={server.id}>
                                <Link className="text-reset" to={{pathname: "/group/"+server.id}} >
                                    {server.serverName}
                                </Link>
                            </li>
                        ))}
                    <li onClick = {() => {if(!openPopup) setOpenPopup(true)}}>
                        Create Server
                        <Popup
                        openPopup = {openPopup}
                        setOpenPopup = {setOpenPopup}
                        user = {props.user}
                        setUser = {props.setUser}
                        servers = {servers}
                        setServers = {setServers}>
                            <CreateServerForm mounted />
                        </Popup>
                    </li>
                    <li onClick = {deleteCurrentServer}>
                        Delete Current Server
                    </li>
                </ul>
            </nav>
        </div>
    );
};