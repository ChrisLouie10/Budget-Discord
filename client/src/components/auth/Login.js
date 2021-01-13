import React, { useRef, useState } from 'react';
import { Card, Form, Button, Alert, Container } from 'react-bootstrap';
import { Link, useHistory } from "react-router-dom";

// Simple Login page

export default function Login() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const [error, setError] = useState();
  const [loading, setLoading] = useState();
  const history = useHistory();

  async function handleSubmit(e){
    e.preventDefault();

    try{
      setError('');
      setLoading(true);
      await fetch('http://localhost:3000/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: emailRef.current.value,
          password: passwordRef.current.value
        })
      }).then(response => {
        return response.json()})
        .then((data) => {
          if(data.success){
            localStorage.setItem('Authorization', data.Authorization);
            history.push("/dashboard");
          } else setError(data.message);
        })
    }
    finally{
      setLoading(false);
    }
  }
  return (
    <Container className="d-flex align-items-center justify-content-center"
        style={{minHeight: "100vh"}}>
      <div className="w-100" style={{maxWidth: "400px"}}>
        <Card>
          <Card.Body>
            <h2 className="text-center mb-4">Log In</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group id="email">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" ref={emailRef} required></Form.Control>
              </Form.Group>
              <Form.Group id="password">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" ref={passwordRef} required></Form.Control>
              </Form.Group>
              <Button disabled={loading} className="w-25" type="Submit">Login</Button>
            </Form>
          </Card.Body>
        </Card>
        <div className="w-100 text-center mt-2">
          Need an account? <Link to="/signup">Sign Up</Link>
        </div>
      </div>
    </Container>
  )
}


