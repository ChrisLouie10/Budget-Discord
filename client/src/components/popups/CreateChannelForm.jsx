import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { useHistory, useParams } from 'react-router-dom';
import { UserContext } from '../../contexts/user-context';
import { GroupServersContext } from '../../contexts/groupServers-context';

export default function CreateChannelForm({ setOpenPopup }) {
  const [user, setUser] = useContext(UserContext);
  const [groupServers, setGroupServers] = useContext(GroupServersContext);
  const [input, setInput] = useState('new-channel');
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  const { groupServerId } = useParams();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    let newTextChannelId;
    try {
      await fetch(`/api/group-servers/${groupServerId}/text-channels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: input,
        }),
      }).then(async (response) => {
        const data = await response.json();
        if (response.status === 201) {
          const _groupServers = { ...groupServers };
          newTextChannelId = data.textChannelId;
          _groupServers[groupServerId].textChannels[newTextChannelId] = data.textChannel;
          setGroupServers(_groupServers);
          setLoading(false);
          setOpenPopup(false);
        } else console.error(data.message);
      });
    } finally {
      if (newTextChannelId) { history.push(`/group/${groupServerId}/${newTextChannelId}`); } else history.push('/friends');
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
  setOpenPopup: PropTypes.func.isRequired,
};
