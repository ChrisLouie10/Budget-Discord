import React, { useState, useEffect } from 'react';
import { Button, Card, Alert } from 'react-bootstrap';
import { Link, useHistory } from "react-router-dom";
import LeftSideNav from '../LeftSideNav.js'
const jwt = require('jsonwebtoken');

// Simple private account information.

export default function Dashboard() {
  const [error, setError] = useState("");
  const [user, setUser] = useState(jwt.verify(localStorage.getItem('access-token'), process.env.REACT_APP_SECRET_ACCESS_TOKEN));
  const history = useHistory();

  async function handleLogout(){
    setError('');

    try{
      await fetch('http://localhost:3000/api/user/logout', {
        method: 'DELETE',
        headers: {
          'auth-token': localStorage.getItem('auth-token')
        }
      }).then(response => {
        if(!response.ok) setError(response.statusText);
        else{
          localStorage.removeItem('auth-token');
          localStorage.removeItem('access-token');
          history.push('/login');
        }
      });
    }
    catch{}
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-1 bg-dark" style={{minHeight: "100vh"}}>
          <LeftSideNav />
        </div>
        <div className="col-11 my-auto">
            <div className="card mx-auto" style={{maxWidth: "400px"}}>
              <div className="card-body">
                <div className="card-header text-center mb-4">
                  <h2>Profile</h2>
                </div>
                {error && <Alert variant="danger">{error}</Alert>}
                <div>
                  <strong>Name:</strong> {user.user.name}
                </div>
                <div>
                  <strong>Email:</strong> {user.user.email}
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
