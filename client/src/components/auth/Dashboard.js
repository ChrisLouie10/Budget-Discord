import React, { useState } from 'react';
import { Link, useHistory } from "react-router-dom";
// Simple private account information.

export default function Dashboard(props) {

  const [error, setError] = useState("");
  const history = useHistory();

  async function handleLogout(){
    setError('');

    await fetch('http://localhost:3000/api/user/logout', {
      method: 'DELETE',
      headers: {
        'Authorization': localStorage.getItem('Authorization')
      }
    }).then(response => { return response.json()})
      .then(data => {
      if(!data.success) setError(response.statusText);
      else{
        localStorage.removeItem('Authorization');
        history.push('/login');
      }
    });
  }

  return (
    <div className="col-11 my-auto">
      <div className="card mx-auto" style={{maxWidth: "400px"}}>
        <div className="card-body">
          <div className="card-header text-center mb-4">
            <h2>Profile</h2>
          </div>
          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          <div>
            <strong>Name:</strong> {props.user.name} #{props.user.number_id}
          </div>
          <div>
            <strong>Email:</strong> {props.user.email}
          </div>
          <Link to="/change-name" className="btn btn-primary w-100 mt-3">Change Name</Link>
          <Link to="/change-password" className="btn btn-primary w-100 mt-3">Change Password</Link>
          <Link to="/delete-account" className="btn btn-danger w-100 mt-3">Delete Account</Link>
        </div>
      </div>
      <div className="w-100 text-center mt-2">
        <button type="button" className="btn btn-link" onClick={handleLogout}>Log Out</button>
      </div>
    </div>
  )
}
