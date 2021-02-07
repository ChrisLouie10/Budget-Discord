import React, {useState, useEffect} from "react";
import { useHistory } from "react-router-dom";

export default function DeleteGroupServerForm(props){

    const controller = new AbortController();
    const { signal } = controller;
    const [mounted, setMounted] = useState(true);
    const history = useHistory();
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(()=>{
        return function(){
            setMounted(false);
            controller.abort();
        };
    }, []);

    async function deleteCurrentServer(){
        if (props.groupServerId && mounted){
            setLoading(true);
            try{
                await fetch('http://localhost:3000/api/groupServer/delete', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': localStorage.getItem('Authorization')
                    },
                    body: JSON.stringify({
                        type: "delete",
                        groupServerId: props.groupServerId,
                        userId: props.userId
                    }),
                    signal
                }).then(response => { return response.json(); })
                    .then((data) => {
                        if (!data.success) console.log(data.message);
                        else {
                            props.setOpenPopup(false);
                            props.fetchServerListInfo();
                            history.push("/dashboard");
                        }
                });
            } finally{
                if (mounted)
                    setLoading(false);
            }
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