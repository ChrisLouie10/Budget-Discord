import React, { useRef, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';

// // Simple Update Profile page

export default function DeleteAccount() {
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

    try {
      setLoading(true);
      await fetch('/api/user', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: passwordRef.current.value,
        }),
      }).then((response) => response.json())
        .then((data) => {
          if (!data.success) setError(data.message);
          else history.push('/login');
        });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="col-11 my-auto">
      <div className="card mx-auto" style={{ maxWidth: '400px' }}>
        <div className="card-body">
          <div className="card-header text-center mb-4">
            <h2>Delete Account</h2>
          </div>
          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3" id="password">
              <label htmlFor="input-password">Enter Password to Delete Account</label>
              <input className="form-control" type="password" id="input-password" ref={passwordRef} required />
            </div>
            <div className="mb-3" id="password-confirm">
              <label htmlFor="input-password-confirm">Confirm Password</label>
              <input className="form-control" type="password" id="input-password-confirm" ref={passwordConfirmRef} required />
            </div>
            <button disabled={loading} className="btn btn-danger w-5" type="submit">Delete</button>
          </form>
        </div>
      </div>
    </div>
  );
}
