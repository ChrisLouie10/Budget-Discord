import React, { useRef, useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { Link, useHistory } from 'react-router-dom';
import LeftSideNav from '../LeftSideNav.js';
const jwt = require('jsonwebtoken');

// // Simple Update Profile page

export default function UpdateProfile() {
  
  const [user, setUser] = useState(jwt.verify(localStorage.getItem('access-token'), process.env.REACT_APP_SECRET_ACCESS_TOKEN));
  const oldPasswordRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const [error, setError] = useState();
  const [loading, setLoading] = useState();
  const history = useHistory();

  async function handleSubmit(e){
    e.preventDefault();

    if(passwordRef.current.value !== passwordConfirmRef.current.value){
      return setError('Passwords do not match');
    }

    try{
      setLoading(true);
      console.log(user.user['email']);
      await fetch('http://localhost:3000/api/user/check-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: user.user['email'],
          oldPassword: oldPasswordRef.current.value,
          password: passwordRef.current.value
        })
      }).then(response => {
        if(!response.ok) setError(response.statusText);
        else{
          history.push("/");
        }
        return response.json()
      })
    }
    finally{
      setLoading(false);
    }
  }
  
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-1 bg-dark" style={{minHeight: "100vh"}}>
          <LeftSideNav user={user} setUser={setUser}/>
        </div>
        <div className="col-11 my-auto">
          <div className="card mx-auto" style={{maxWidth: "400px"}}>
            <div className="card-body">
              <div className="card-header text-center mb-4">
                <h2>Update Profile</h2>
              </div>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group id="password">
                  <Form.Label>Old Password</Form.Label>
                  <Form.Control type="password" ref={oldPasswordRef}></Form.Control>
                </Form.Group>
                <Form.Group id="password">
                  <Form.Label>Password</Form.Label>
                  <Form.Control type="password" ref={passwordRef}></Form.Control>
                </Form.Group>
                <Form.Group id="password-confirm">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control type="password" ref={passwordConfirmRef}></Form.Control>
                </Form.Group>
                <Button disabled={loading} className="w-25" type="Submit">Update</Button>
              </Form>
            </div>
          </div>
          <div className="w-100 text-center mt-2">
            <Link to="/">Cancel</Link>
          </div>
        </div>
      </div>
    </div>
  );
}


