import React, { useState } from 'react'

export default function FriendsList(props) {
  const [loading, setLoading] = useState(false);
  const [pressed, setPressed] = useState(false);

  async function handleFriendDelete(e){
    e.preventDefault();

    try{
      props.setError('');
      setLoading(true);
      props.handleFriendDelete(props.friend);
      await fetch('/api/friends/delete-friend', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('Authorization')
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
    <div className="d-flex m-2 mx-auto" style={{maxWidth: "800px"}} key={props.friend.id}>
      <p className="mr-auto p-2">{props.friend.name} #{props.friend.numberID} </p>
      <button 
        disabled={loading} 
        className="btn btn-primary" 
        onClick={handleFriendDelete}>Remove Friend
      </button>
    </div>
  )
}
