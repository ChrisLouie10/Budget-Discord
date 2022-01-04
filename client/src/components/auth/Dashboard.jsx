import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useHistory } from 'react-router-dom';
// Simple private account information.

export default function Dashboard({ user }) {
  const [error, setError] = useState('');
  const history = useHistory();

  async function handleLogout() {
    setError('');
    localStorage.removeItem('Authorization');
    history.push('/login');
  }

  return (
    <div className="col-11 my-auto">
      <div className="card mx-auto" style={{ maxWidth: '400px' }}>
        <div className="card-body">
          <div className="card-header text-center mb-4">
            <h2>Profile</h2>
          </div>
          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          <div>
            <strong>Name:</strong>
            {' '}
            {user.name}
            {' '}
            #
            {user.number_id}
          </div>
          <div>
            <strong>Email:</strong>
            {' '}
            {user.email}
          </div>
          <Link to="/change-name" className="btn btn-primary w-100 mt-3">Change Name</Link>
          <Link to="/change-password" className="btn btn-primary w-100 mt-3">Change Password</Link>
          <Link to="/delete-account" className="btn btn-danger w-100 mt-3">Delete Account</Link>
        </div>
      </div>
      <div className="w-100 text-center mt-2">
        <button type="button" className="btn btn-link" onClick={handleLogout}>Log Out</button>
      </div>
    </div>
  );
}

Dashboard.propTypes = {
  // eslint-disable-next-line
  user: PropTypes.object.isRequired
};
