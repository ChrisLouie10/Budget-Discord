import React from 'react';
import { Redirect } from 'react-router-dom';
import TextChat from './textchat/TextChat.js';

export default function GroupServer(props){

    function userHasAccess(){
        let bool = false;
        props.user.servers.forEach((server) => {
            if (server === props.computedMatch.params.serverId){
                bool = true;
                return;
            }
        });
        return bool;
    }

    return(
       <>
           {
                userHasAccess() ? 
                <TextChat serverId={props.computedMatch.params.serverId} user={props.user}/>
                :
                <Redirect to="/dashboard" />
           }
       </>
    );
}
