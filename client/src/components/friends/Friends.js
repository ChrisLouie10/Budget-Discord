import React, { useRef, useState, useEffect } from 'react';
import { Form, Button, Alert, Container } from 'react-bootstrap';
import FriendRequests from './FriendRequests';
import FriendsList from './FriendsList';
import SearchFriends from './SearchFriends';
import searchArrayForIndex from '../../lib/searchArrayForIndex';

// Simple Login page

export default function Friend(props) {
  const friendNameRef = useRef();
  const friendNumberRef = useRef();
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
      setFriendResults([]);
      await fetch('/api/friends/find-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('Authorization')
        },
        body: JSON.stringify({
          friendName: friendNameRef.current.value,
          friendNumber: friendNumberRef.current.value
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

  const handleFriendDelete = (friendToDelete) => {
    const index = searchArrayForIndex(friendToDelete.id, 'id', friends);
    const newFriends = [...friends]
    newFriends.splice(index, 1);
    if(index > -1) setFriends(newFriends);  }

  const handleFriendAccept = (friendToAccept) => {
    const index = searchArrayForIndex(friendToAccept.id, 'id', friendRequests);
    const newFriendRequests =[...friendRequests]
    newFriendRequests.splice(index, 1)
    if(index > -1) setFriendRequests(newFriendRequests);
    const newFriends = [...friends];
    newFriends.push(friendToAccept);
    setFriends(newFriends)
  };

  useEffect(async () =>{
    setShowFriendRequests(false);
    await fetch('/api/friends/get-friend-requests', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('Authorization')
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
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('Authorization')
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
      {showFriendRequests ? friends.map((friend) => <FriendsList handleFriendDelete={handleFriendDelete} setError={setError} key={friend.id} friend={friend} />) : <div></div> }
      <hr />
      {showFriendRequests ? friendRequests.map((friend) => <FriendRequests handleFriendAccept={handleFriendAccept} setError={setError} key={friend.id} friend={friend} />) : <div> </div>}
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
            <Form.Group id="number_id">
              <Form.Label>Enter Friend's Number ID (Optional)</Form.Label>
              <Form.Control type="text" ref={friendNumberRef}></Form.Control>
            </Form.Group>
            <Button disabled={loading} className="w-25" type="Submit">Find</Button>
          </Form>
        </div>
      </div>
      <div className="mx-auto" style={{maxWidth: "800px"}}>
        {friendResults.map((friend) => <SearchFriends setError={setError} key={friend.id} friend={friend} />)}
      </div>
    </div>
  );
}