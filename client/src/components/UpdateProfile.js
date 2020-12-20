import React, { useRef, useState } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { Link, useHistory } from 'react-router-dom';


export default function UpdateProfile() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const { currentUser, updateEmail, updatePassword } = useAuth();
  const [error, setError] = useState();
  const [loading, setLoading] = useState();
  const history = useHistory();

  function handleSubmit(e){
    e.preventDefault();

    if(passwordRef.current.value !== passwordConfirmRef.current.value){
      return setError('Passwords do not match');
    }

    const promises = [];
    if(emailRef.current.value !== currentUser.email){
      promises.push(updateEmail(emailRef.current.value));
    }
    if(passwordRef.current.value){
      promises.push(updatePassword(passwordRef.current.value));
    }
    Promise.all(promises).then(() => {
      history.push('/');
    }).catch(() => {
      setError('Failed to update account');
    }).finally(() => {
      setLoading(false);
    })

    try{
      setError('');
      setLoading(true);
      history.push("/");
    }
    catch{
      setError('Failed to create an account');
    }
    setLoading(false);
  }
  
  return (
    <>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Update Profile</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group id="email">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" ref={emailRef} required defaultValue={currentUser.email}></Form.Control>
            </Form.Group>
            <Form.Group id="password">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" ref={passwordRef} placeholder="Leave blank to keep the same password"></Form.Control>
            </Form.Group>
            <Form.Group id="password-confirm">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control type="password" ref={passwordConfirmRef} placeholder="Leave blank to keep the same password"></Form.Control>
            </Form.Group>
            <Button disabled={loading}classname="w-25" type="Submit">Update</Button>
          </Form>
        </Card.Body>
      </Card>
      <div className="w-100 text-center mt-2">
        <Link to="/Dashboard">Cancel</Link>
      </div>
    </>
  )
}


