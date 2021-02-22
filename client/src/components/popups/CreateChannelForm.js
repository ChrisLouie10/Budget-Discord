import React, { useState, useEffect} from 'react';
import { useHistory } from "react-router-dom";

export default function CreateChannelForm(props){

    const controller = new AbortController();
    const { signal } = controller;
    const [input, setInput] = useState("new-channel");
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
                    if(data.success) {
                        let groupServers = {...props.groupServers};
                        newTextChannelId = data.textChannelId;
                        groupServers[props.groupServerId].textChannels[newTextChannelId] = data.textChannel;
                        props.setGroupServers({...groupServers});
                        setLoading(false);
                        props.setOpenPopup(false);
                    }
                });
        }finally{
            if (newTextChannelId)
                history.push("/group/"+props.groupServerId+"/"+newTextChannelId);
            else history.push("/dashboard");
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