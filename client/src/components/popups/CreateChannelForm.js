import React, { useState, useEffect} from 'react';
import { useHistory } from "react-router-dom";

export default function CreateChannelForm(props){

    const controller = new AbortController();
    const { signal } = controller;
    const [input, setInput] = useState("new-channel");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const history = useHistory();

    useEffect(()=>{
        return function cleanup(){
            controller.abort();
        }
    }, []);

    async function handleSubmit(e){
        e.preventDefault();
        setLoading(true);
        let newTextChannelId;
        try{
            await fetch('http://localhost:3000/api/groupServer/create-channel', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('Authorization')
              },
              body: JSON.stringify({
                type: "create-channel",
                name: input,
                userId: props.userId,
                groupServerId: props.groupServerId
              }),
              signal
            }).then(response => { return response.json(); })
                .then((data) => {
                    if(!data.success) setError(data.message);
                    else {
                        let textChannels = {...props.textChannels};
                        let groupServers = {...props.groupServers};
                        newTextChannelId = data.textChannel._id;
                        groupServers[data.textChannel.group_server_id].textChannels.push(data.textChannel._id);
                        textChannels[newTextChannelId] = {
                            chatLog: data.textChannel.chat_log,
                            date: data.textChannel.date,
                            groupServerId: data.textChannel.group_server_id,
                            name: data.textChannel.name
                        };
                        props.setGroupServers({...groupServers});
                        props.setTextChannels({...textChannels});
                        setLoading(false);
                        props.setOpenPopup(false);
                    }
                });
        }finally{
            history.push("/group/"+props.groupServerId+"/"+newTextChannelId);
        }
    }

    const handleInputChange = (e) => {
        setInput(e.target.value);
    }

    return(
        <form>
            <div className="form-group">
                <label htmlFor="createServerInput">Group Server Name</label>
                <input 
                    type="text" 
                    className="form-control" 
                    id="createServerInput" 
                    aria-describedby="serverInputHelp" 
                    value={input}
                    onChange={handleInputChange}
                />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary" onClick={handleSubmit}>Create</button>
        </form>
    );
};