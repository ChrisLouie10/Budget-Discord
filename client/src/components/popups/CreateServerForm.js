import React, { useState, useEffect} from 'react';

export default function CreateServerForm(props){

<<<<<<< HEAD
=======
    const controller = new AbortController();
    const { signal } = controller;
>>>>>>> 47177db4f7aa31e71d595d0204bef91474c8ca0e
    const [input, setInput] = useState(props.others.user.name + "'s Server");
    const [error, setError] = useState("");
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
                userId: props.others.user._id
              }),
              signal
            }).then(response => { return response.json(); })
                .then((data) => {
                    if(!data.success) setError(data.message);
                    else if (props.mounted) props.others.fetchServerListInfo();
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