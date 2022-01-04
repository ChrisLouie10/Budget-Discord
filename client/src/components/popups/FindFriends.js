import React, { useRef, useState, useEffect } from 'react';
import { Form, Button, Alert, Container } from 'react-bootstrap';
import LeftSideNav from '../ServersList.js';


// Simple Login page

export default function FindFriend(props) {
  const [user, setUser] = useState(props.user);
  const friendNameRef = useRef();
  const [friends, setFriends] = useState([]);
  const [friendResults, setFriendResults] = useState([]);
  const [showFriendRequests, setShowFriendRequests] = useState(false);
  const [friendRequests, setFriendRequests] = useState([]);
  const [error, setError] = useState();
  const [loading, setLoading] = useState();

  async function handleSubmit(e){
    e.preventDefault();

    try{
      setError('');
      setLoading(true);
      await fetch('/api/friends/find', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          friendName: friendNameRef.current.value
        })
      }).then(response => {
        return response.json()})
        .then((data) => {
          if(data.success) {
            if(data.friendResult.length == 0){
              setError('No Users found')
            }
            else{
              setFriendResults(data.friendResult);
            }
          }
          else setError(data.message);
        })
    }
    finally{
      setLoading(false);
    }
  }

  async function handleFriendRequest(id, e){
    e.preventDefault();

    try{
      setError('');
      setLoading(true);
      await fetch('/api/friends/send-friend-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          friendID: id
        })
      }).then(response => {
        return response.json()})
        .then((data) => {
          if(data.success) console.log(data.message);
          else setError(data.message);
        })
    }
    finally{
      setLoading(false);
    }
  }

  async function handleFriendRequestAccept(id, e){
    e.preventDefault();

    try{
      setError('');
      setLoading(true);
      await fetch('/api/friends/accept-friend-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          friendID: id
        })
      }).then(response => {
        return response.json()})
        .then((data) => {
          if(data.success) console.log(data.message);
          else setError(data.message);
        })
    }
    finally{
      setLoading(false);
    }
  }

  async function handleFriendDelete(id, e){
    e.preventDefault();

    try{
      setError('');
      setLoading(true);
      await fetch('/api/friends/delete-friend', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          friendID: id
        })
      }).then(response => {
        return response.json()})
        .then((data) => {
          if(data.success) console.log(data.message);
          else setError(data.message);
        })
    }
    finally{
      setLoading(false);
    }
  }

  useEffect(async () =>{
    setShowFriendRequests(false);
    await fetch('/api/friends/get-friend-requests', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    }).then(response => {
      return response.json()})
      .then((data) => {
        if(data.success) setFriendRequests(data.friendRequests);
        else setError(data.message);
      })
    await fetch('/api/friends/get-friends', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    }).then(response => {
      return response.json()})
      .then((data) => {
        if(data.success) setFriends(data.friends);
        else setError(data.message);
      })
    setShowFriendRequests(true);
  }, []);

  return (
        <div className="col-11 my-auto bg-secondary d-flex-column" style={{minHeight: "100vh"}}>
          {showFriendRequests ? friends.map((friend) => (
              <div className="d-flex m-2 mx-auto" style={{maxWidth: "800px"}} key={friend.id}>
                <p className="mr-auto p-2">{friend.name} </p>
                <button 
                  disabled={loading} 
                  className="btn btn-primary" 
                  onClick={(e) => handleFriendDelete(friend.id, e)}>Remove Friend
                </button>
              </div>
            )) : <div> </div> }
          <hr />
          {showFriendRequests ? friendRequests.map((friend) => (
              <div className="d-flex m-2 mx-auto" style={{maxWidth: "800px"}} key={friend.id}>
                <p className="mr-auto p-2">{friend.name} </p>
                <button 
                  disabled={loading} 
                  className="btn btn-primary" 
                  onClick={(e) => handleFriendRequestAccept(friend.id, e)}>Accept Friend Request
                </button>
              </div>
            )) : <div> </div>}
          <div className="card mx-auto" style={{maxWidth: "400px"}}>
            <div className="card-body bg-light">
              <div className="card-header text-center mb-4">
                <h2>Find Friend</h2>
              </div>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group id="friend">
                  <Form.Label>Enter Friend's Name</Form.Label>
                  <Form.Control type="text" ref={friendNameRef}></Form.Control>
                </Form.Group>
                <Button disabled={loading} className="w-25" type="Submit">Find</Button>
              </Form>
            </div>
          </div>
          <div className="mx-auto" style={{maxWidth: "800px"}}>
            {friendResults.map((friend) => (
              <div className="d-flex m-2" key={friend.id}>
                <p className="mr-auto p-2">{friend.name}: {friend.id} </p>
                <button disabled={loading} className="btn btn-primary" onClick={(e) => handleFriendRequest(friend.id, e)}>Add Friend</button>
              </div>
            ))}
          </div>
        </div>
  );
}