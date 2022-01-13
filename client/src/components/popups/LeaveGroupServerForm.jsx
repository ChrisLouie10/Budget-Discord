import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { useHistory, useParams } from 'react-router-dom';
import { UserContext } from '../../contexts/user-context';
import { GroupServersContext } from '../../contexts/groupServers-context';

const propTypes = {
  setOpenPopup: PropTypes.func.isRequired,
};

export default function LeaveGroupServerForm({ setOpenPopup }) {
  const [user, setUser] = useContext(UserContext);
  const [groupServers, setGroupServers] = useContext(GroupServersContext);
  const [mounted, setMounted] = useState(true);
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  const { groupServerId } = useParams();

  // eslint-disable-next-line
  useEffect(() => function () {
    setMounted(false);
  }, []);

  async function leaveGroupServer() {
    if (groupServerId && mounted) {
      setLoading(true);
      await fetch('/api/group-servers/leave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'leave',
          groupServerId,
          userId: user._id,
        }),
      }).then((response) => response.json())
        .then((data) => {
          if (data.success && mounted) {
            history.push('/dashboard');
            const _groupServers = { ...groupServers };
            delete _groupServers[groupServerId];
            setUser(data.user);
            setGroupServers(_groupServers);
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
          {groupServers[groupServerId].name}
          ? You won't
          be able to rejoin unless you are re-invited.
        </p>
      </div>
      <button type="submit" disabled={loading} className="btn" onClick={handleCancel}>Cancel</button>
      <button type="submit" disabled={loading} className="btn btn-danger" onClick={handleSubmit}>Leave</button>
    </form>
  );
}

LeaveGroupServerForm.propTypes = propTypes;
