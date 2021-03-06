import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Loading from '../auth/Loading';

export default function JoinGroupServer(props){

    const controller = new AbortController();
    const { signal } = controller;
    const history = useHistory();

    useEffect(async ()=>{
        let groupServerId;
        if (props.computedMatch.params.inviteCode){
            await fetch('/api/groupServer/join', {
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
                        if (data.success){
                            groupServerId = data.groupServerId;
                            let groupServers = {...props.groupServers};
                            groupServers[groupServerId] = data.groupServer;
                            props.setGroupServers({...groupServers});
                            history.push("/group/"+groupServerId);
                        }
                        else {
                            console.log(data.message)
                            history.push("/dashboard");
                        };
                    });
        }
        return function cleanup(){
           controller.abort();
        }
    }, []);

    return(
        <Loading />
    )
}