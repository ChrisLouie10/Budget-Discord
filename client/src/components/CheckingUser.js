import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function CheckingUser() {
  const { currentUser } = useAuth();

  return (
    <>
      <p>This shows if the current user is logged in. {currentUser.email}</p>
    </>
  )
}
