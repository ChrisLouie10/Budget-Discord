import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

export default function CreateServerForm(props){

    const [input, setInput] = useState(props.others.user.name + "'s Server");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e){
        e.preventDefault();

        setLoading(true);
        const serverName = input;

        try{
            fetch('http://localhost:3000/api/groupServer/create', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('Authorization')
              },
              body: JSON.stringify({
                serverName: serverName,
                userId: props.others.user._id
              })
            }).then(response => { return response.json(); })
                .then((data) => {
                    if(!data.success) setError(data.message);
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