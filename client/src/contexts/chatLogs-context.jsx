import React, { useState, createContext } from 'react';
import PropTypes from 'prop-types';

const InitialChatLogs = {};

export const ChatLogsContext = createContext();

export default function ChatLogsProvider({ children }) {
  const [chatLogs, setChatLogs] = useState(InitialChatLogs);
  return (
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    <ChatLogsContext.Provider value={[chatLogs, setChatLogs]}>{children}</ChatLogsContext.Provider>
  );
}

ChatLogsProvider.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  children: PropTypes.any.isRequired,
};
