import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import Loading from '../auth/Loading';

export default function JoinGroupServer({
  computedMatch, user, groupServers, setGroupServers,
}) {
  const controller = new AbortController();
  const { signal } = controller;
  const history = useHistory();

  useEffect(async () => {
    let groupServerId;
    if (computedMatch.params.inviteCode) {
      await fetch('/api/groupServer/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'join',
          inviteCode: computedMatch.params.inviteCode,
          userId: user._id,
        }),
        signal,
      }).then((response) => response.json())
        .then((data) => {
          if (data.success) {
            groupServerId = data.groupServerId;
            const _groupServers = { ...groupServers };
            _groupServers[groupServerId] = data.groupServer;
            setGroupServers({ ..._groupServers });
            history.push(`/group/${groupServerId}`);
          } else {
            console.log(data.message);
            history.push('/dashboard');
          }
        });
    }
    return function cleanup() {
      controller.abort();
    };
  }, []);

  return (
    <Loading />
  );
}

JoinGroupServer.propTypes = {
  // eslint-disable-next-line
  user: PropTypes.object.isRequired,
  // eslint-disable-next-line
  computedMatch: PropTypes.object.isRequired,
  // eslint-disable-next-line
  groupServers: PropTypes.object.isRequired,
  setGroupServers: PropTypes.func.isRequired,
};
