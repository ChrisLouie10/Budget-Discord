import React, {useState, useEffect} from "react";
import { useHistory } from "react-router-dom";

export default function DeleteGroupServerForm(props){

    const [mounted, setMounted] = useState(true);
    const history = useHistory();
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(()=>{
        return function(){
            setMounted(false);
        };
    }, []);

    async function deleteCurrentServer(){
        if (props.groupServerId && mounted){
            setLoading(true);
            await fetch('/api/groupServer/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('Authorization')
                },
                body: JSON.stringify({
                    type: "delete",
                    groupServerId: props.groupServerId,
                    userId: props.userId
                })
            }).then(response => { return response.json(); })
                .then((data) => {
                    if (data.success){
                        history.push("/dashboard");
                        let groupServers = {...props.groupServers};
                        delete groupServers[props.groupServerId];
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
        if (input === props.groupServerName) deleteCurrentServer();
    }

    return(
        <form>
            <div className="form-group">
                <p>Type "{props.groupServerName}" to confirm deletion</p>
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