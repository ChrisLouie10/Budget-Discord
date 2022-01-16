import React, { useRef, useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';

// Simple Login page

export default function Login() {
  const [mounted, setMounted] = useState(true);
  const emailRef = useRef();
  const passwordRef = useRef();
  const [error, setError] = useState();
  const [loading, setLoading] = useState();
  const history = useHistory();

  useEffect(() => function cleanup() {
    setMounted(false);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      await fetch('/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailRef.current.value,
          password: passwordRef.current.value,
        }),
      }).then((response) => response.json())
        .then((data) => {
          if (data.success) {
            history.push('/friends');
          } else setError(data.message);
        });
    } finally {
      if (mounted) setLoading(false);
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
              <h2>Log In</h2>
            </div>
            {error && <div className="alert alert-danger" role="alert">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3" id="email">
                <label htmlFor="input-email">Email</label>
                <input type="email" className="form-control" id="input-email" ref={emailRef} required />
              </div>
              <div className="mb-3" id="password">
                <label htmlFor="input-password">Password</label>
                <input type="password" className="form-control" id="input-password" ref={passwordRef} required />
              </div>
              <button disabled={loading} className="btn btn-primary w-25" type="submit">Login</button>
            </form>
          </div>
        </div>
        <div className="w-100 text-center mt-2">
          Need an account?
          {' '}
          <Link to="/signup">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
