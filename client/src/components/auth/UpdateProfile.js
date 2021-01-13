import React, { useRef, useState } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useHistory } from 'react-router-dom';
const jwt = require('jsonwebtoken');

// // Simple Update Profile page

export default function UpdateProfile(props) {
  const [user, setUser] = useState(props.user);
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
      await fetch('http://localhost:3000/api/user/check-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('Authorization')
        },
        body: JSON.stringify({
          email: user.email,
          oldPassword: oldPasswordRef.current.value,
          password: passwordRef.current.value
        })
      }).then(response => { return response.json()})
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
    <>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Update Profile</h2>
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
        </Card.Body>
      </Card>
      <div className="w-100 text-center mt-2">
        <Link to="/">Cancel</Link>
      </div>
    </>
  )
}


