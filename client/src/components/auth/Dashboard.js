import React, { useState, useEffect } from 'react';
import { Button, Card, Alert } from 'react-bootstrap';
import { Link, useHistory } from "react-router-dom";
import LeftSideNav from '../LeftSideNav.js'
const jwt = require('jsonwebtoken');

// Simple private account information.

export default function Dashboard(props) {

  const [error, setError] = useState("");
  const [user, setUser] = useState(props.user);
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
    <div className="container-fluid">
      <div className="row">
        <div className="col-1 bg-dark" style={{minHeight: "100vh"}}>
          <LeftSideNav user={user} setUser={setUser} />
        </div>
        <div className="col-11 my-auto">
            <div className="card mx-auto" style={{maxWidth: "400px"}}>
              <div className="card-body">
                <div className="card-header text-center mb-4">
                  <h2>Profile</h2>
                </div>
                {error && <Alert variant="danger">{error}</Alert>}
                <div>
                  <strong>Name:</strong> {user.name}
                </div>
                <div>
                  <strong>Email:</strong> {user.email}
                </div>
                <Link to="/update-profile" className="btn btn-primary w-100 mt-3">Update Profile</Link>
              </div>
            </div>
            <div className="w-100 text-center mt-2">
              <Button variant="link" onClick={handleLogout}>Log Out</Button>
            </div>
        </div>
      </div>
    </div>
  )
}
