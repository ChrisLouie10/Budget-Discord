import React, {useState, useEffect} from "react";
import { useHistory } from "react-router-dom";

export default function DeleteChannelForm(props){

    const controller = new AbortController();
    const { signal } = controller;
    const history = useHistory();
    const [textChannelName] = useState(props.groupServers[props.groupServerId].textChannels[props.textChannelId].name);
    const [input, setInput] = useState("");
    const [mounted, setMounted] = useState(true);
    const [loading, setLoading] = useState(false);

    useEffect(()=>{
        return function(){
            setMounted(false);
            controller.abort();
        };
    }, []);

    async function deleteCurrentChannel(){
        //We want group servers to have at least one channel. So don't delete if there is only one channel left.
        const numOfTextChannels = Object.keys(props.groupServers[props.groupServerId].textChannels).length;
        if (mounted &&  numOfTextChannels > 1){
            setLoading(true);
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
                    if (data.success){
                        history.push("/dashboard");
                        let groupServers = {...props.groupServers};
                        delete groupServers[props.groupServerId].textChannels[props.textChannelId];
                        props.setGroupServers({...groupServers});
                    }
                    else console.log(data.message);
            });
        }
    }

    function handleInputChange(e){
        setInput(e.target.value);
    }

    function handleSubmit(e){
        e.preventDefault();
        if (input === textChannelName) deleteCurrentChannel();
    }

    return(
        <form>
            <div className="form-group">
                <p>Type "{textChannelName}" to confirm deletion</p>
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