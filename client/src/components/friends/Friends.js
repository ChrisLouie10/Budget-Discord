import React, { useRef, useState, useEffect } from 'react';
import { Form, Button, Alert, Container } from 'react-bootstrap';
import FriendRequests from './FriendRequests';
import FriendsList from './FriendsList';
import SearchFriends from './SearchFriends';

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
      await fetch('http://localhost:3000/api/friends/find-users', {
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

  useEffect(async () =>{
    setShowFriendRequests(false);
    await fetch('http://localhost:3000/api/friends/get-friend-requests', {
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
    await fetch('http://localhost:3000/api/friends/get-friends', {
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
      {showFriendRequests ? friends.map((friend) => <FriendsList setError={setError} key={friend.id} friend={friend} />) : <div></div> }
      <hr />
      {showFriendRequests ? friendRequests.map((friend) => <FriendRequests setError={setError} key={friend.id} friend={friend} />) : <div> </div>}
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