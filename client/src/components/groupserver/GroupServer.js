import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import ServersSidebar from '../ServersSidebar.js';
import TextChat from './textchat/TextChat.js';

export default function GroupServer(props){

    const [user, setUser] = useState(props.user);

    function userHasAccess(){
        let bool = false;
        user.servers.forEach((server) => {
            if (server === props.computedMatch.params.serverId){
                bool = true;
                return;
            }
        });
        return bool;
    }

    return(
       <div>
           {
                userHasAccess() ? 
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-1" style={{minHeight: "100vh", background: "#212121"}}>
                            <ServersSidebar 
                            serverId={props.computedMatch.params.serverId} 
                            user={user} 
                            setUser={setUser}/>
                        </div>
                        <TextChat serverId={props.computedMatch.params.serverId} user={user}/>
                    </div>
                </div> 
                :
                <Redirect to="/dashboard" />
           }
       </div>
    );
}
