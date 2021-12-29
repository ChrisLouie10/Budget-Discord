import React, { useState } from 'react';
import PropTypes from 'prop-types';

export default function FriendRequests({ setError, friend, handleFriendAccept }) {
  const [loading, setLoading] = useState(false);
  const [pressed, setPressed] = useState(false);

  async function handleFriendRequestAccept(e) {
    setError('');
    e.preventDefault();

    try {
      setLoading(true);
      handleFriendAccept(friend);
      await fetch('/api/friends/accept-friend-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('Authorization'),
        },
        body: JSON.stringify({
          friendID: friend.id,
        }),
      }).then((response) => response.json())
        .then((data) => {
          if (data.success) console.log(data.message);
          else setError(data.message);
        });
      setPressed(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="d-flex m-2 mx-auto" style={{ maxWidth: '800px' }}>
      <p className="mr-auto p-2">
        {friend.name}
        {' '}
        #
        {friend.numberID}
        {' '}
      </p>
      <button
        disabled={loading || pressed}
        className="btn btn-primary"
        onClick={handleFriendRequestAccept}
        type="button"
      >
        {pressed ? 'Accepted' : 'Accept Friend Request'}
      </button>
    </div>
  );
}

FriendRequests.propTypes = {
  // eslint-disable-next-line
  friend: PropTypes.object.isRequired,
  handleFriendAccept: PropTypes.func.isRequired,
  setError: PropTypes.func.isRequired,
};
