import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Form, Button, Alert,
} from 'react-bootstrap';
import FriendRequests from './FriendRequests';
import FriendsList from './FriendsList';
import SearchFriends from './SearchFriends';
import searchArrayForIndex from '../../lib/searchArrayForIndex';

export default function FriendHome(props) {
  const {
    friends, friendRequests, setFriends, setFriendRequests,
  } = props;

  const friendNameRef = useRef();
  const friendNumberRef = useRef();
  const [friendResults, setFriendResults] = useState([]);

  const [error, setError] = useState();
  const [loading, setLoading] = useState();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      setFriendResults([]);
      await fetch('/api/friends/find', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          friendName: friendNameRef.current.value,
          friendNumber: friendNumberRef.current.value,
        }),
      }).then((response) => response.json())
        .then((data) => {
          if (data.success) {
            if (data.friendResult.length == 0) {
              setError('No Users found');
            } else {
              setFriendResults(data.friendResult);
            }
          } else setError(data.message);
        });
    } finally {
      setLoading(false);
    }
  }

  const handleFriendDelete = (friendToDelete) => {
    const index = searchArrayForIndex(friendToDelete.id, 'id', friends);
    const newFriends = [...friends];
    newFriends.splice(index, 1);
    if (index > -1) setFriends(newFriends);
  };

  const handleFriendAccept = (friendToAccept) => {
    const index = searchArrayForIndex(friendToAccept.id, 'id', friendRequests);
    const newFriendRequests = [...friendRequests];
    newFriendRequests.splice(index, 1);
    if (index > -1) setFriendRequests(newFriendRequests);
    const newFriends = [...friends];
    newFriends.push(friendToAccept);
    setFriends(newFriends);
  };

  // eslint-disable-next-line
  function displayFriends() {
    if (friends) {
      return (
        <>
          {friends && friends.length > 0 ? friends.map((friend) => <FriendsList handleFriendDelete={handleFriendDelete} setError={setError} key={friend.id} friend={friend} />) : <div /> }
          <hr />
          {friendRequests && friendRequests.length > 0 ? friendRequests.map((friend) => <FriendRequests handleFriendAccept={handleFriendAccept} setError={setError} key={friend.id} friend={friend} />) : <div /> }
        </>
      );
    }
  }

  return (
    <div className="col-10 align-self-end w-100" style={{ minHeight: '100vh', background: '#303030' }}>
      <div className="row">
        <h5 className="text-white">Friends</h5>
      </div>
      <div className="row mb-4">
        <ul className="list-unstyled text-white m-auto">
          {displayFriends()}
        </ul>
      </div>
      <div className="col-12 my-auto bg-secondary d-flex-column" style={{ minHeight: '70vh' }}>
        <div className="card mx-auto" style={{ maxWidth: '400px' }}>
          <div className="card-body bg-light">
            <div className="card-header text-center mb-4">
              <h2>Find Friend</h2>
            </div>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group id="friend">
                <Form.Label>Enter Friend's Name</Form.Label>
                <Form.Control type="text" ref={friendNameRef} />
              </Form.Group>
              <Form.Group id="number_id">
                <Form.Label>Enter Friend's Number ID (Optional)</Form.Label>
                <Form.Control type="text" ref={friendNumberRef} />
              </Form.Group>
              <Button disabled={loading} className="w-25" type="Submit">Find</Button>
            </Form>
          </div>
        </div>
        <div className="mx-auto" style={{ maxWidth: '800px' }}>
          {friendResults.map((friend) => <SearchFriends setError={setError} key={friend.id} friend={friend} />)}
        </div>
      </div>
    </div>
  );
}

FriendHome.propTypes = {
  // eslint-disable-next-line
  friends: PropTypes.array.isRequired,
  // eslint-disable-next-line
  friendRequests: PropTypes.array.isRequired,
  setFriends: PropTypes.func.isRequired,
  setFriendRequests: PropTypes.func.isRequired,
};
