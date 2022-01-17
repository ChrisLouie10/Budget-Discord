import React, { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import FriendSidebar from './FriendSidebar';
import FriendHome from './FriendHome';
import PrivateChat from './chat/PrivateChat';

// Simple Login page

export default function Friend() {
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [privateChats, setPrivateChats] = useState([]);
  const [error, setError] = useState();
  const { privateChatId } = useParams();

  useEffect(async () => {
    await fetch('/api/friends/requests', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => response.json())
      .then((data) => {
        console.log(data);
        if (data.success) setFriendRequests(data.friendRequests);
        else setError(data.message);
      });
    await fetch('/api/friends', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => response.json())
      .then((data) => {
        if (data.success) setFriends(data.friends);
        else setError(data.message);
      });
    await fetch('/api/private-chat', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => response.json())
      .then((data) => {
        if (data.success) setPrivateChats(data.privateChats);
        else setError(data.message);
      });
  }, []);

  return (
    <>
      <div className="col-1" style={{ minHeight: '100vh', background: '#292929' }}>
        <FriendSidebar friends={friends} friendRequests={friendRequests} setFriends={setFriends} setFriendRequests={setFriendRequests} />
      </div>
      {privateChatId ? <PrivateChat />
        : <FriendHome friends={friends} friendRequests={friendRequests} setFriends={setFriends} setFriendRequests={setFriendRequests} />}
    </>

  );
}
