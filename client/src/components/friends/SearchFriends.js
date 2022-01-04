import React, { useState } from 'react'

export default function SearchFriends(props) {
  const [loading, setLoading] = useState(false);
  const [pressed, setPressed] = useState(false);

  async function handleFriendRequest(e){
    e.preventDefault();

    try{
      props.setError('');
      setLoading(true);
      await fetch('/api/friends/send-friend-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          friendID: props.friend.id
        })
      }).then(response => {
        return response.json()})
        .then((data) => {
          if(data.success) console.log(data.message);
          else props.setError(data.message);
        })
      setPressed(true);
    }
    finally{
      setLoading(false);
    }
  }

  console.log(props.props)

  return (
    <div className="d-flex m-2">
      <p className="mr-auto p-2">{props.friend.name} #{props.friend.numberID} </p>
      <button 
        disabled={loading || pressed} 
        className="btn btn-primary" 
        onClick={handleFriendRequest}
      >
        {pressed ? "Added": "AddFriend"}
      </button>
    </div>
  )
}
