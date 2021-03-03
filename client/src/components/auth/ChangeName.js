import React, { useRef, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';

// // Simple Update Profile page

export default function ChangeName(props) {
  const [user, setUser] = useState(props.user);
  const nameRef = useRef();
  const passwordRef = useRef();
  const [error, setError] = useState();
  const [loading, setLoading] = useState();
  const history = useHistory();

  async function handleSubmit(e){
    e.preventDefault();

    try{
      setLoading(true);
      await fetch('/api/user/change-name', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('Authorization')
        },
        body: JSON.stringify({
          name: nameRef.current.value,
          password: passwordRef.current.value
        })
      }).then(response => { return response.json() })
        .then(data => {
          if(!data.success) setError(data.message);
          else history.push("/dashboard");
      })
    }
    finally{
      setLoading(false);
    }
  }
  
  return (
    <div className="col-11 my-auto">
      <div className="card mx-auto" style={{maxWidth: "400px"}}>
        <div className="card-body">
          <div className="card-header text-center mb-4">
            <h2>Change Name</h2>
          </div>
          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3" id="old-password">
              <label htmlFor="input-old-password">Name</label>
              <input className="form-control" type="name" id="input-name" ref={nameRef} required></input>
            </div>
            <div className="mb-3" id="password">
              <label htmlFor="input-password">Password</label>
              <input className="form-control" type="password" id="input-password" ref={passwordRef} required></input>
            </div>
            <button disabled={loading} className="btn btn-primary w-25" type="Submit">Update</button>
          </form>
        </div>
      </div>
      <div className="w-100 text-center mt-2">
        <Link to="/dashboard">Cancel</Link>
      </div>
    </div>
  );
}


