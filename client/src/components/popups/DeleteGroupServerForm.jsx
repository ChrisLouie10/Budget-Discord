import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';

export default function DeleteGroupServerForm({
  groupServerId, userId, groupServers, setGroupServers, groupServerName,
}) {
  const [mounted, setMounted] = useState(true);
  const history = useHistory();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // eslint-disable-next-line
  useEffect(() => function () {
    setMounted(false);
  }, []);

  async function deleteCurrentServer() {
    if (groupServerId && mounted) {
      console.log('Gonna try to delete or something');
      setLoading(true);
      await fetch('/api/groupServer/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'delete',
          groupServerId,
          userId,
        }),
      }).then((response) => response.json())
        .then((data) => {
          if (data.success) {
            history.push('/dashboard');
            const _groupServers = { ...groupServers };
            delete _groupServers[groupServerId];
            setGroupServers({ ..._groupServers });
          } else console.log(data.message);
        });
    }
  }

  function handleInputChange(e) {
    setInput(e.target.value);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (input === groupServerName) deleteCurrentServer();
  }

  return (
    <form>
      <div className="form-group">
        <p>
          Type "
          {groupServerName}
          " to confirm deletion
        </p>
        <input
          type="text"
          className="form-control"
          id="deleteInput"
          value={input}
          onChange={handleInputChange}
        />
      </div>
      <button type="submit" disabled={loading} className="btn btn-danger" onClick={handleSubmit}>Confirm</button>
    </form>
  );
}

DeleteGroupServerForm.propTypes = {
  groupServerId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  // eslint-disable-next-line
  groupServers: PropTypes.object.isRequired,
  setGroupServers: PropTypes.func.isRequired,
  groupServerName: PropTypes.string.isRequired,
};
