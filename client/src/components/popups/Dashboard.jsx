import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { Link, useHistory } from 'react-router-dom';
import { UserContext } from '../../contexts/user-context';
import ChangeName from './ChangeName';
import ChangePassword from './ChangePassword';
import DeleteAccount from './DeleteAccount';
// Simple private account information.

export default function Dashboard({
  dashboardDialog, setDashboardDialog, setOpenPopup,
}) {
  const [user, setUser] = useContext(UserContext);
  const [error, setError] = useState('');
  const history = useHistory();

  async function handleLogout() {
    await fetch('/api/user/logout', {
      method: 'DELETE',
    }).then((response) => response.json())
      .then((data) => {
        if (!data.success) setError(data.statusText);
        else {
          history.push('/login');
        }
      });
  }
  function displayContents() {
    if (dashboardDialog === 0) {
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
              <li onClick={() => { setDashboardDialog(1); }}>
                <a className="text-reset" role="button">Change Name</a>
              </li>
              <li onClick={() => { setDashboardDialog(2); }}>
                <a className="text-reset" role="button">Change Password</a>
              </li>
              <li onClick={() => { setDashboardDialog(3); }}>
                <a className="text-reset" role="button">Delete Acount</a>
              </li>
            </div>
          </div>
          <div className="w-100 text-center mt-2">
            <button type="button" className="btn btn-link" onClick={handleLogout}>Log Out</button>
          </div>
        </div>
      );
    }
    if (dashboardDialog === 1) {
      return <ChangeName />;
    }
    if (dashboardDialog === 2) {
      return <ChangePassword />;
    }
    if (dashboardDialog === 3) {
      return <DeleteAccount />;
    }
    return -1;
  }
  return (
    displayContents()
  );
}

Dashboard.propTypes = {
  dashboardDialog: PropTypes.number.isRequired,
  setDashboardTitle: PropTypes.func.isRequired,
  setDashboardDialog: PropTypes.func.isRequired,
  setOpenPopup: PropTypes.func.isRequired,
};
