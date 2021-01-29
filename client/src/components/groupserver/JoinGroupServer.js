import React, { useState, useEffect } from 'react';
import { Redirect, useHistory } from 'react-router-dom';
import Loading from '../auth/Loading';

export default function JoinGroupServer(props){

    const controller = new AbortController();
    const { signal } = controller;
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState();
    const [serverId, setServerId] = useState("");
    const history = useHistory();

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
                            setServerId(data.serverId);
                            props.fetchServerListInfo(true, true);
                            setSuccess(data.success);
                            setLoading(false);
                        });
            }finally{
                history.push("/group/"+serverId);
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
                <Loading />
                :
               (success ? 
              <></>
               :
              <></>) 
            }
        </>
    )
}