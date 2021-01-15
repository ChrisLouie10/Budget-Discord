import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import Popup from "./popups/Popup.js";
import CreateServerForm from "./popups/CreateServerForm.js";

export default function ServersSidebar(props){

    const [openPopup, setOpenPopup] = useState(false);
    const [error, setError] = useState("");
    const [servers, setServers] = useState([]);
    const [loading, setLoading] = useState(false);
    const history = useHistory();

    useEffect(()=>{
        fetchServerListInfo();
    }, []);

    function fetchServerListInfo(){
        console.log("Fetching for serverId:", props.user.servers);
        try{
            fetch('http://localhost:3000/api/groupServer/find', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('Authorization')
                },
                body: JSON.stringify({
                    serverIds: props.user.servers
                })
            }).then(response => { return response.json(); })
                .then((data) => {
                    if (!data.success) setError(data.message);
                    else {
                        setServers(data.servers);
                    }
                });
        }finally{
            setLoading(false);
        }
    }

    async function deleteCurrentServer(e){
        e.preventDefault();

        if (props.serverId){
            setLoading(true);
            
            try{
                fetch('http://localhost:3000/api/groupServer/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': localStorage.getItem('Authorization')
                    },
                    body: JSON.stringify({
                        serverId: props.serverId,
                        userId: props.user._id
                    })
                }).then(response => { return response.json(); })
                    .then((data) => {
                        if (!data.success) setError(data.message);
                        else {
                            props.setUser(data.user);
                            history.push("/dashboard");
                        }
                    });
            }finally{
                setLoading(false);
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
                    <li onClick = {() => {if(!openPopup || !loading) setOpenPopup(true)}}>
                        Create Server
                        <Popup
                        openPopup = {openPopup}
                        setOpenPopup = {setOpenPopup}
                        user = {props.user}
                        setUser = {props.setUser}>
                            <CreateServerForm />
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