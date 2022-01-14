import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

export default function FriendsList({ setError, handleFriendDelete, friend }) {
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [pressed, setPressed] = useState(false);

  // eslint-disable-next-line
  async function handleFriendDelete(e) {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      handleFriendDelete(friend);
      await fetch(`/api/friends?friendId=${friend.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
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
      <Link className="mr-auto p-2 text-reset" to={{ pathname: `/friends/${friend.id}` }}>
        {friend.name}
        {' '}
        #
        {friend.numberID}
        {' '}
      </Link>
      <button
        disabled={loading}
        className="btn btn-primary"
        onClick={handleFriendDelete}
        type="button"
      >
        Remove Friend
      </button>
    </div>
  );
}

FriendsList.propTypes = {
  // eslint-disable-next-line
  friend: PropTypes.object.isRequired,
  handleFriendDelete: PropTypes.func.isRequired,
  setError: PropTypes.func.isRequired,
};
