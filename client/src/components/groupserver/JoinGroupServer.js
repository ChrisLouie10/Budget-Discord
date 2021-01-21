import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';

export default function JoinGroupServer(props){

    const controller = new AbortController();
    const { signal } = controller;
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState();
    const [serverId, setServerId] = useState("");

    useEffect(async ()=>{
        if (props.computedMatch.params.inviteCode){
            try{
                await fetch('http://localhost:3000/api/groupServer/join', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': localStorage.getItem('Authorization')
                        },
                        body: JSON.stringify({
                            type: "join",
                            inviteCode: props.computedMatch.params.inviteCode,
                            userId: props.user._id
                        }),
                        signal
                    }).then(response => { return response.json(); })
                        .then((data) => {
                            console.log("message:", data.message);
                            setServerId(data.serverId);
                            props.fetchServerListInfo();
                            setSuccess(data.success);
                        });
            }finally{
                setLoading(false);
            }
        }
        return function cleanup(){
           controller.abort();
        }
    }, []);

    return(
        <>
            {
                loading ?
                <p>Loading</p>
                :
               (success ? 
               <Redirect to={{pathname: "/group/"+serverId}} />
               :
               <Redirect to="/dashboard" />) 
            }
        </>
    )
}