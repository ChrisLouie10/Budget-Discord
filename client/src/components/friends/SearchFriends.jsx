import React, { useState } from 'react';
import PropTypes from 'prop-types';

export default function SearchFriends({ friend, setError }) {
  const [loading, setLoading] = useState(false);
  const [pressed, setPressed] = useState(false);

  async function handleFriendRequest(e) {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      await fetch('/api/friends/send-friend-request', {
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
    <div className="d-flex m-2">
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
        onClick={handleFriendRequest}
        type="button"
      >
        {pressed ? 'Added' : 'AddFriend'}
      </button>
    </div>
  );
}

SearchFriends.propTypes = {
  // eslint-disable-next-line
  friend: PropTypes.object.isRequired,
  setError: PropTypes.func.isRequired,
};
