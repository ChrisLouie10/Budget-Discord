import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';

export default function FriendsList({ setError, handleFriendDelete, friend }) {
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [pressed, setPressed] = useState(false);
  const history = useHistory();
  const userID = localStorage.getItem('user_id_cache');

  async function handleFriendMessage(e, friendID) {
    e.preventDefault();

    try {
      setError('');
      const existingChat = await fetch(`/api/private-chat/${friendID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }).then((response) => response.json())
        .then((data) => {
          if (data.success) return data.privateChatId;
          return null;
        });

      if (existingChat) {
        history.push(`/friends/${existingChat}`);
      } else {
        await fetch('/api/private-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userID,
            friendId: friendID,
          }),
        }).then((response) => response.json())
          .then((data) => {
            if (data.success) history.push(`/friends/${data.privateChatId}`);
            else setError(data.message);
          });
      }
    } catch (err) {
      setError(err);
    }
  }

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
      <p className="mr-auto p-2 text-reset" style={{ cursor: 'pointer' }} onClick={(e) => handleFriendMessage(e, friend.id)}>
        {friend.name}
        {' '}
        #
        {friend.numberID}
        {' '}
      </p>
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
