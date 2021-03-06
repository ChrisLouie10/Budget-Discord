import React, {useState, useEffect} from "react";
import { useHistory } from "react-router-dom";

export default function LeaveGroupServerForm(props){

    const [mounted, setMounted] = useState(true);
    const history = useHistory();
    const [loading, setLoading] = useState(false);

    useEffect(()=>{
        return function(){
            setMounted(false);
        };
    }, []);

    async function leaveGroupServer(){
        if (props.groupServerId && mounted){
            setLoading(true);
            await fetch('/api/groupServer/leave', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('Authorization')
                },
                body: JSON.stringify({
                    type: "leave",
                    groupServerId: props.groupServerId,
                    userId: props.userId
                })
            }).then(response => { return response.json(); })
                .then((data) => {
                    if (data.success && mounted){
                        history.push("/dashboard");
                        let groupServers = {...props.groupServers};
                        delete groupServers[props.groupServerId];
                        props.setGroupServers({...groupServers})
                        props.setUser(data.user);
                    }
                    else console.log(data.message);
            });
        }
    }

    function handleSubmit(e){
        e.preventDefault();
        leaveGroupServer();
    }

    function handleCancel(e){
        e.preventDefault();
        props.setOpenPopup(false);
    }

    return(
        <form>
            <div className="form-group">
                <p>
                    Are you sure you want to leave {props.groupServerName}? You won't
                    be able to rejoin unless you are re-invited.
                </p>
            </div>
            <button type="submit" disabled={loading} className="btn" onClick={handleCancel}>Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-danger" onClick={handleSubmit}>Leave</button>
        </form>
    );
}