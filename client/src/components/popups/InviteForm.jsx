import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { UserContext } from '../../contexts/user-context';
import { GroupServersContext } from '../../contexts/groupServers-context';

export default function InviteForm() {
  const [user, setUser] = useContext(UserContext);
  const [groupServers, setGroupServers] = useContext(GroupServersContext);
  const [loading, setLoading] = useState(false);
  const [inviteUrl, setInviteUrl] = useState('');
  const [expiration, setExpiration] = useState('30');
  const [limit, setLimit] = useState('1');
  const { groupServerId } = useParams();

  useEffect(() => {
    const groupServer = groupServers[groupServerId];
    if (groupServer.inviteCode) {
      setInviteUrl(`${process.env.REACT_APP_URI}/join/${groupServers[groupServerId].inviteCode}`);
    }
  }, [groupServerId]);

  async function generateInviteLink(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`/api/group-servers/${groupServerId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expiration: parseInt(expiration, 10),
          limit: parseInt(limit, 10),
        }),
      }).then(async (response) => {
        const data = await response.json();
        if (response.status === 201) {
          setInviteUrl(`${process.env.REACT_APP_URI}/join/${data.code}`);
          const _groupServers = { ...groupServers };
          _groupServers[groupServerId].inviteCode = data.code;
          setGroupServers(_groupServers);
        } console.error(data.message);
      });
    } finally { setLoading(false); }
  }

  function handleExpirationChange(e) {
    setExpiration(e.target.value);
  }

  function handleLimitChange(e) {
    setLimit(e.target.value);
  }

  function handleChange(e) {
    setInviteUrl(e.target.value);
  }

  return (
    <form>
      <div className="form-group">
        <label htmlFor="expire">Expire After</label>
        <select id="expire" value={expiration} onChange={handleExpirationChange} className="form-control">
          <option value="30">30 minutes</option>
          <option value="60">1 hour</option>
          <option value="360">6 hours</option>
          <option value="720">12 hours</option>
          <option value="1440">1 day</option>
          <option value="-1">Never</option>
        </select>
        <label htmlFor="limit">Max number of uses</label>
        <select id="limit" value={limit} onChange={handleLimitChange} className="form-control">
          <option value="1">1</option>
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="50">50</option>
          <option value="100">100</option>
          <option value="-1">No Limit</option>
        </select>
      </div>
      <button type="submit" disabled={loading} className="btn btn-primary" onClick={generateInviteLink}>Generate New Invite Link</button>
      <div className="form-group">
        <label htmlFor="invite">Invite Link</label>
        <input className="form-control" type="text" value={inviteUrl} onChange={handleChange} readOnly />
      </div>
    </form>
  );
}
