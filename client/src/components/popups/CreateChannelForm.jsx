import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';

export default function CreateChannelForm({
  userId, groupServerId, groupServers, setGroupServers, setOpenPopup,
}) {
  const [input, setInput] = useState('new-channel');
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    let newTextChannelId;
    try {
      await fetch('/api/groupServer/create-channel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('Authorization'),
        },
        body: JSON.stringify({
          type: 'create-channel',
          name: input,
          userId,
          groupServerId,
        }),
      }).then((response) => response.json())
        .then((data) => {
          if (data.success) {
            const _groupServers = { ...groupServers };
            newTextChannelId = data.textChannelId;
            _groupServers[groupServerId].textChannels[newTextChannelId] = data.textChannel;
            setGroupServers({ ..._groupServers });
            setLoading(false);
            setOpenPopup(false);
          }
        });
    } finally {
      if (newTextChannelId) { history.push(`/group/${groupServerId}/${newTextChannelId}`); } else history.push('/dashboard');
    }
  }

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  return (
    <form>
      <div className="form-group">
        <label htmlFor="createServerInput">Group Server Name</label>
        <input
          type="text"
          className="form-control"
          id="createServerInput"
          aria-describedby="serverInputHelp"
          value={input}
          onChange={handleInputChange}
        />
      </div>
      <button type="submit" disabled={loading} className="btn btn-primary" onClick={handleSubmit}>Create</button>
    </form>
  );
}

CreateChannelForm.propTypes = {
  userId: PropTypes.string.isRequired,
  groupServerId: PropTypes.string.isRequired,
  // eslint-disable-next-line
  groupServers: PropTypes.object.isRequired,
  setGroupServers: PropTypes.func.isRequired,
  setOpenPopup: PropTypes.func.isRequired,
};
