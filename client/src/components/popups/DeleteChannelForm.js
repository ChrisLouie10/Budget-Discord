import React, {useState, useEffect} from "react";
import { useHistory } from "react-router-dom";

export default function DeleteChannelForm(props){

    const controller = new AbortController();
    const { signal } = controller;
    const history = useHistory();
    const [mounted, setMounted] = useState(true);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(()=>{
        return function(){
            setMounted(false);
            controller.abort();
        };
    }, []);

    async function deleteCurrentChannel(){
        if (props.groupServerId && mounted && props.groupServers[props.groupServerId].textChannels.length > 1){
            setLoading(true);
            try{
                await fetch('http://localhost:3000/api/groupServer/delete-channel', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': localStorage.getItem('Authorization')
                    },
                    body: JSON.stringify({
                        type: "delete-channel",
                        groupServerId: props.groupServerId,
                        textChannelId: props.textChannelId,
                        userId: props.userId
                    }),
                    signal
                }).then(response => { return response.json(); })
                    .then((data) => {
                        if (!data.success) setError(data.message);
                        else {
                            let textChannels = {...props.textChannels};
                            let groupServers = {...props.groupServers};
                            delete textChannels[props.textChannelId];
                            const index = groupServers[props.groupServerId].textChannels.indexOf(props.textChannelId);
                            if (index > -1){
                                groupServers[props.groupServerId].textChannels.splice(index, 1);
                            }
                            props.setTextChannels(textChannels);
                            props.setGroupServers(groupServers);
                            
                            setLoading(false);
                            props.setOpenPopup(false);
                        }
                });
            } finally{
                if (mounted){
                    history.push("/dashboard");
                }
            }
        }
    }

    function handleInputChange(e){
        setInput(e.target.value);
    }

    function handleSubmit(e){
        e.preventDefault();
        if (input === props.textChannels[props.textChannelId].name) deleteCurrentChannel();
    }

    return(
        <form>
            <div className="form-group">
                <p>Type "{props.textChannels[props.textChannelId].name}" to confirm deletion</p>
                <input 
                    type="text"
                    className="form-control"
                    id="deleteInput"
                    value={input}
                    onChange={handleInputChange}
                />
            </div>
            <button type="submit" disabled={loading} className="btn btn-danger" onClick={handleSubmit}>Confirm</button>
        </form>
    );
}