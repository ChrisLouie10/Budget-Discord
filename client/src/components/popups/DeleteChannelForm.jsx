import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';

export default function DeleteChannelForm({
  groupServers, groupServerId, textChannelId, userId, setGroupServers,
}) {
  const history = useHistory();
  const [textChannelName] = useState(groupServers[groupServerId].textChannels[textChannelId].name);
  const [input, setInput] = useState('');
  // eslint-disable-next-line
  const [mounted, setMounted] = useState(true);
  const [loading, setLoading] = useState(false);

  async function deleteCurrentChannel() {
    // We want group servers to have at least one channel. So don't delete if there is only one channel left.
    const numOfTextChannels = Object.keys(groupServers[groupServerId].textChannels).length;
    if (mounted && numOfTextChannels > 1) {
      setLoading(true);
      await fetch('/api/groupServer/delete-channel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'delete-channel',
          groupServerId,
          textChannelId,
          userId,
        }),
      }).then((response) => response.json())
        .then((data) => {
          if (data.success) {
            history.push('/dashboard');
            const _groupServers = { ...groupServers };
            delete _groupServers[groupServerId].textChannels[textChannelId];
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
    if (input === textChannelName) deleteCurrentChannel();
  }

  return (
    <form>
      <div className="form-group">
        <p>
          Type "
          {textChannelName}
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

DeleteChannelForm.propTypes = {
  // eslint-disable-next-line
  groupServers: PropTypes.object.isRequired,
  groupServerId: PropTypes.string.isRequired,
  textChannelId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  setGroupServers: PropTypes.func.isRequired,
};
