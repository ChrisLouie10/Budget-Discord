import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { useHistory, useParams } from 'react-router-dom';
import { Context } from '../../contexts/Store';

const propTypes = {
  setOpenPopup: PropTypes.func.isRequired,
};

export default function LeaveGroupServerForm({ setOpenPopup }) {
  const [state, setState] = useContext(Context);
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
      await fetch('/api/groupServer/leave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'leave',
          groupServerId,
          userId: state.user._id,
        }),
      }).then((response) => response.json())
        .then((data) => {
          if (data.success && mounted) {
            history.push('/dashboard');
            const currState = { ...state };
            const groupServers = currState;
            delete groupServers[groupServerId];
            currState.user = data.user;
            setState(currState);
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
          {state.groupServers[groupServerId].name}
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
