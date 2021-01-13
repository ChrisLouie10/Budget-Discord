import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

export default function CreateServerForm(props){

    const [input, setInput] = useState(props.others.user.user.name + "'s Server");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const history = useHistory();

    //generates a random 16 length string as a unique server id
    const generateUniqueServerId = () => {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return s4() + s4() + s4() + s4();
    };

    async function handleSubmit(e){
        e.preventDefault();

        setLoading(true);
        const serverId = generateUniqueServerId();
        const serverName = input;

        try{
            fetch('http://localhost:3000/api/createServer/create', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('Authorization')
              },
              body: JSON.stringify({
                serverName: serverName,
                serverId: serverId,
                userId: props.others.user._id
              })
            }).then(response => { return response.json(); })
                .then((data) => {
                    if(!data.success) setError(data.messsage);
                    else props.others.setUser(data.user);
                });
        }finally{
            setLoading(false);
        }

        props.setOpenPopup(false);
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