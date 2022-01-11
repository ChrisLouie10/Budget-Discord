import React, { useRef, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';

// Simple Signup page

export default function Signup() {
  const nameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const [error, setError] = useState();
  const [loading, setLoading] = useState();
  const history = useHistory();

  // eslint-disable-next-line
  async function handleSubmit(e) {
    e.preventDefault();

    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError('Passwords do not match');
    }
    setError('');
    setLoading(true);
    try {
      fetch('/api/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: nameRef.current.value,
          email: emailRef.current.value,
          password: passwordRef.current.value,
        }),
      }).then((response) => response.json())
        .then((data) => {
          if (!data.success) {
            setError(data.message);
            console.log(data.message);
          } else {
            history.push('/dashboard');
          }
        });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="container d-flex align-items-center justify-content-center"
      style={{ minHeight: '100vh' }}
    >
      <div className="w-100" style={{ maxWidth: '400px' }}>
        <div className="card">
          <div className="card-body">
            <div className="card-header text-center mb-4">
              <h2>Sign Up</h2>
            </div>
            {error && <div className="alert alert-danger" role="alert">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3" id="name">
                <label htmlFor="input-name">Name</label>
                <input type="name" className="form-control" id="input-name" ref={nameRef} required />
              </div>
              <div className="mb-3" id="email">
                <label htmlFor="input-email">Email</label>
                <input type="email" className="form-control" id="input-email" ref={emailRef} required />
              </div>
              <div className="mb-3" id="password">
                <label htmlFor="input-password">Password</label>
                <input className="form-control" type="password" id="input-password" ref={passwordRef} required />
              </div>
              <div className="mb-3" id="password-confirm">
                <label htmlFor="input-password-confirm">Confirm Password</label>
                <input className="form-control" type="password" id="input-password-confirm" ref={passwordConfirmRef} required />
              </div>
              <button disabled={loading} className="btn btn-primary w-25" type="submit">Submit</button>
            </form>
          </div>
        </div>
        <div className="w-100 text-center mt-2">
          Already have an account?
          {' '}
          <Link to="/login">Log In</Link>
        </div>
      </div>
    </div>
  );
}
