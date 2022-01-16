import React, { useState, createContext } from 'react';
import PropTypes from 'prop-types';

const InitialPendingMessages = {};

export const PendingMessagesContext = createContext();

export default function PendingMessagesProvider({ children }) {
  const [pendingMessages, setPendingMessages] = useState(InitialPendingMessages);
  return (
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    <PendingMessagesContext.Provider value={[pendingMessages, setPendingMessages]}>{children}</PendingMessagesContext.Provider>
  );
}

PendingMessagesProvider.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  children: PropTypes.any.isRequired,
};
