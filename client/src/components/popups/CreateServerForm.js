import React, { useState, useEffect} from 'react';

export default function CreateServerForm(props){

    const controller = new AbortController();
    const { signal } = controller;
    const [input, setInput] = useState(props.user.name + "'s Server");
    const [loading, setLoading] = useState(false);

    useEffect(()=>{
        return function cleanup(){
            controller.abort();
        }
    }, []);

    async function handleSubmit(e){
        e.preventDefault();
        setLoading(true);

        try{
            fetch('http://localhost:3000/api/groupServer/create', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('Authorization')
              },
              body: JSON.stringify({
                type: "create",
                name: input,
                userId: props.user._id
              }),
              signal
            }).then(response => { return response.json(); })
                .then((data) => {
                    if(data.success){
                        let groupServers = {...props.groupServers};
                        groupServers[data.groupServerId] = data.groupServer;
                        props.setGroupServers({...groupServers});
                    }
                });
        }finally{
            setLoading(false);
            props.setOpenPopup(false);
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