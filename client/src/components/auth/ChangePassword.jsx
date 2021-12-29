import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useHistory } from 'react-router-dom';

// // Simple Update Profile page

export default function ChangePassword({ user }) {
  const oldPasswordRef = useRef();
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
      await fetch('/api/user/change-password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('Authorization'),
        },
        body: JSON.stringify({
          email: user.email,
          oldPassword: oldPasswordRef.current.value,
          password: passwordRef.current.value,
        }),
      }).then((response) => response.json())
        .then((data) => {
          if (!data.success) setError(data.message);
          else history.push('/dashboard');
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
            <h2>Update Profile</h2>
          </div>
          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3" id="old-password">
              <label htmlFor="input-old-password">Old Password</label>
              <input className="form-control" type="password" id="input-old-password" ref={oldPasswordRef} required />
            </div>
            <div className="mb-3" id="password">
              <label htmlFor="input-password">Password</label>
              <input className="form-control" type="password" id="input-password" ref={passwordRef} required />
            </div>
            <div className="mb-3" id="password-confirm">
              <label htmlFor="input-password-confirm">Confirm Password</label>
              <input className="form-control" type="password" id="input-password-confirm" ref={passwordConfirmRef} required />
            </div>
            <button disabled={loading} className="btn btn-primary w-25" type="submit">Update</button>
          </form>
        </div>
      </div>
      <div className="w-100 text-center mt-2">
        <Link to="/dashboard">Cancel</Link>
      </div>
    </div>
  );
}

ChangePassword.propTypes = {
  // eslint-disable-next-line
  user: PropTypes.object.isRequired
};
