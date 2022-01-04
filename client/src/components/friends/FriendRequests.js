import React, { useState } from 'react'

export default function FriendRequests(props) {
  const [loading, setLoading] = useState(false);
  const [pressed, setPressed] = useState(false);

  async function handleFriendRequestAccept(e){
    props.setError('');
    e.preventDefault();

    try{
      setLoading(true);
      props.handleFriendAccept(props.friend);
      await fetch('/api/friends/accept-friend-request', {
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

  return (
    <div className="d-flex m-2 mx-auto" style={{maxWidth: "800px"}}>
      <p className="mr-auto p-2">{props.friend.name} #{props.friend.numberID} </p>
      <button 
        disabled={loading || pressed} 
        className="btn btn-primary" 
        onClick={handleFriendRequestAccept} >{pressed ? "Accepted" : "Accept Friend Request"}
      </button>
    </div>
  )
}
