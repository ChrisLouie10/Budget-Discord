import React, { useState, useContext } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Context } from '../../contexts/Store';

export default function DeleteChannelForm() {
  const history = useHistory();
  const { groupServerId, textChannelId } = useParams();
  const [state, setState] = useContext(Context);
  const [textChannelName] = useState(state.groupServers[groupServerId].textChannels[textChannelId].name);
  const [input, setInput] = useState('');
  // eslint-disable-next-line
  const [mounted, setMounted] = useState(true);
  const [loading, setLoading] = useState(false);

  async function deleteCurrentChannel() {
    // We want group servers to have at least one channel. So don't delete if there is only one channel left.
    const numOfTextChannels = Object.keys(state.groupServers[groupServerId].textChannels).length;
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
          userId: state.user._id,
        }),
      }).then((response) => response.json())
        .then((data) => {
          if (data.success) {
            history.push('/dashboard');
            const currState = { ...state };
            const { groupServers } = currState;
            delete groupServers[groupServerId].textChannels[textChannelId];
            setState(currState);
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
