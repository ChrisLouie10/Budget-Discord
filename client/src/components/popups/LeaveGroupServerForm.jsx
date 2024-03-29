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
      await fetch(`/api/group-servers/${groupServerId}/users`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(async (response) => {
        const data = await response.json();
        history.push('/friends');
        if (response.status === 200) {
          const _groupServers = { ...groupServers };
          delete _groupServers[groupServerId];
          setGroupServers(_groupServers);
        } else console.error(data.message);
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
