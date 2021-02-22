import React, { useState, useEffect } from 'react';

export default function InviteForm(props){

    const controller = new AbortController();
    const { signal } = controller;
    const [loading, setLoading] = useState(false);
    const [inviteUrl, setInviteUrl] = useState("");
    const [expiration, setExpiration] = useState("30");
    const [limit, setLimit] = useState("1");

    useEffect(()=>{
        if (props.groupServers[props.groupServerId].inviteCode)
            setInviteUrl("http://localhost:5000/join/"+props.groupServers[props.groupServerId].inviteCode);
        return function cleanup(){
            controller.abort();
        }
    }, []);

    async function generateInviteLink(e){
        e.preventDefault();
        setLoading(true);

        try{
            await fetch('http://localhost:3000/api/groupServer/create-invite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('Authorization')
                },
                body: JSON.stringify({
                    type: 'create-invite',
                    userId: props.userId,
                    groupServerId: props.groupServerId,
                    expiration: parseInt(expiration),
                    limit: parseInt(limit)
                }),
                signal
            }).then(response => { return response.json(); })
                .then((data) => {
                    if (data.success){
                        setInviteUrl("http://localhost:5000/join/"+data.code);
                        let groupServers = {...props.groupServers};
                        groupServers[props.groupServerId].inviteCode = data.code;
                        props.setGroupServers({...groupServers}); 
                    }
                })
        }finally{ setLoading(false); }
    }

    function handleExpirationChange(e){
        setExpiration(e.target.value);
    }

    function handleLimitChange(e){
        setLimit(e.target.value);
    }

    function handleChange(e){
        setInviteUrl(e.target.value);
    }

    return(
        <form>
            <div className="form-group">
                <label htmlFor="expire">Expire After</label>
                <select id="expire" value={expiration} onChange={handleExpirationChange} className="form-control">
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="360">6 hours</option>
                    <option value="720">12 hours</option>
                    <option value="1440">1 day</option>
                    <option value="-1">Never</option>
                </select>
                <label htmlFor="limit">Max number of uses</label>
                <select id="limit" value={limit} onChange={handleLimitChange} className="form-control">
                    <option value="1">1</option>
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                    <option value="-1">No Limit</option>
                </select>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary" onClick={generateInviteLink}>Generate New Invite Link</button>
            <div className="form-group">
                <label htmlFor="invite">Invite Link</label>
                <input className="form-control" type="text" value={inviteUrl} onChange={handleChange} readOnly/>
            </div>
        </form>
    )
}