import React, { useState, useContext } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { UserContext } from '../../contexts/user-context';
import { GroupServersContext } from '../../contexts/groupServers-context';

export default function DeleteChannelForm() {
  const history = useHistory();
  const { groupServerId, textChannelId } = useParams();
  const [user, setUser] = useContext(UserContext);
  const [groupServers, setGroupServers] = useContext(GroupServersContext);
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
      await fetch(`/api/group-servers/${groupServerId}/text-channels/${textChannelId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(async (response) => {
        const data = await response.json();
        if (response.status === 200) {
          history.push('/dashboard');
          const _groupServers = { ...groupServers };
          delete _groupServers[groupServerId].textChannels[textChannelId];
          setGroupServers(_groupServers);
        } else console.error(data.message);
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
