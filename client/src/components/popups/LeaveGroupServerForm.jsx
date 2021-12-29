import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';

export default function LeaveGroupServerForm({
  groupServerId, userId, groupServers, setGroupServers, setUser, setOpenPopup, groupServerName,
}) {
  const [mounted, setMounted] = useState(true);
  const history = useHistory();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(false);
  }, []);

  async function leaveGroupServer() {
    if (groupServerId && mounted) {
      setLoading(true);
      await fetch('/api/groupServer/leave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('Authorization'),
        },
        body: JSON.stringify({
          type: 'leave',
          groupServerId,
          userId,
        }),
      }).then((response) => response.json())
        .then((data) => {
          if (data.success && mounted) {
            history.push('/dashboard');
            const _groupServers = { ...groupServers };
            delete _groupServers[groupServerId];
            setGroupServers({ ..._groupServers });
            setUser(data.user);
          } else console.log(data.message);
        });
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    leaveGroupServer();
  }

  function handleCancel(e) {
    e.preventDefault();
    setOpenPopup(false);
  }

  return (
    <form>
      <div className="form-group">
        <p>
          Are you sure you want to leave
          {' '}
          {groupServerName}
          ? You won't
          be able to rejoin unless you are re-invited.
        </p>
      </div>
      <button type="submit" disabled={loading} className="btn" onClick={handleCancel}>Cancel</button>
      <button type="submit" disabled={loading} className="btn btn-danger" onClick={handleSubmit}>Leave</button>
    </form>
  );
}

LeaveGroupServerForm.propTypes = {
  groupServerId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  // eslint-disable-next-line
  groupServers: PropTypes.object.isRequired,
  setGroupServers: PropTypes.func.isRequired,
  setUser: PropTypes.func.isRequired,
  setOpenPopup: PropTypes.func.isRequired,
  groupServerName: PropTypes.string.isRequired,
};
