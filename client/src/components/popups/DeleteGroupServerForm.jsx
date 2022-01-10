import React, { useState, useEffect, useContext } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Context } from '../../Store';

export default function DeleteGroupServerForm() {
  const [state, setState] = useContext(Context);
  const [mounted, setMounted] = useState(true);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  const { groupServerId } = useParams();

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
          userId: state.user._id,
        }),
      }).then((response) => response.json())
        .then((data) => {
          if (data.success) {
            history.push('/dashboard');
            const currState = { ...state };
            const groupServers = currState;
            delete groupServers[groupServerId];
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
    if (input === state.groupServers[groupServerId].name) deleteCurrentServer();
  }

  return (
    <form>
      <div className="form-group">
        <p>
          Type "
          {state.groupServers[groupServerId].name}
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
