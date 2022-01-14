import React, { useState, useEffect, useContext } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { UserContext } from '../../contexts/user-context';
import { GroupServersContext } from '../../contexts/groupServers-context';

export default function DeleteGroupServerForm() {
  const [user, setUser] = useContext(UserContext);
  const [groupServers, setGroupServers] = useContext(GroupServersContext);
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
      await fetch(`/api/group-servers/${groupServerId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(async (response) => {
        const data = await response.json();
        console.log(response.status);
        if (response.status === 200) {
          console.log('here');
          history.push('/dashboard');
          const _groupServers = { ...groupServers };
          delete _groupServers[groupServerId];
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
    if (input === groupServers[groupServerId].name) deleteCurrentServer();
  }

  return (
    <form>
      <div className="form-group">
        <p>
          Type "
          {groupServers[groupServerId].name}
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
