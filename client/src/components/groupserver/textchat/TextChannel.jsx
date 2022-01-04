import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export default function TextChannel({
  chatLogs, setChatLogs, user, textChannelId, sendMessage,
}) {
  const [input, setInput] = useState('');

  useEffect(async () => {
    // If the chat log for the text channel with the id "props.textChannelId"
    // doesn't exist in the client, then retrieve it from the server
    if (!chatLogs[textChannelId]) {
      await fetch('/api/groupServer/get-chat-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'get-chat-log',
          userId: user._id,
          textChannelId,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          const _chatLogs = { ...chatLogs };
          _chatLogs[textChannelId] = data.chatLog;
          setChatLogs(_chatLogs);
        });
    }
  }, [textChannelId]);

  function handleChatBoxSubmit(e) {
    e.preventDefault();
    // Check whether input is not just an empty string
    if (input !== '') {
      // Create a message object
      const message = {
        content: input,
        index: Object.keys(chatLogs).length + 1,
        author: user.name,
        timestamp: new Date(),
        notSent: true,
      };
      // Send the message object over to client
      chatLogs[textChannelId].push(message);
      // Send the message object over to the server
      sendMessage(message);
      // Clear chat box
      setInput('');
    }
  }

  function handleChatBoxChange(e) {
    setInput(e.target.value);
  }

  // Displays messages
  // If a message is not "sent" then it will be displayed with a dark gray color
  // Otherwise, sent messages will be light gray
  // eslint-disable-next-line
  function displayChat() {
    if (chatLogs[textChannelId]) {
      return (
        <div className="row">
          <div className="col-12" aria-orientation="vertical" style={{ height: '100%', position: 'absolute', overflowY: 'scroll' }}>
            {
                Object.entries(chatLogs[textChannelId]).map(([key, value]) => {
                  if (value.notSent) {
                    return (
                      <p className="ml-2 #858585" key={key}>
                        {value.author}
                        {' '}
                        (
                        {new Date(value.timestamp).toLocaleString()}
                        ):
                        <br />
                        {value.content}
                      </p>
                    );
                  }

                  return (
                    <p className="ml-2" style={{ color: '#c2c2c2' }} key={key}>
                      {value.author}
                      {' '}
                      (
                      {new Date(value.timestamp).toLocaleString()}
                      ):
                      <br />
                      {value.content}
                    </p>
                  );
                })
              }
          </div>
        </div>
      );
    }
  }

  return (
    <div className="col-10 align-self-end w-100" style={{ minHeight: '100vh', background: '#303030' }}>
      {displayChat()}
      <form className="w-75 mb-2" style={{ position: 'absolute', bottom: '0' }}>
        <div className="form-row">
          <div className="col">
            <input type="text" className="form-control " id="chatBox" value={input} onChange={handleChatBoxChange} />
          </div>
          <button type="submit" className="btn btn-primary" onClick={handleChatBoxSubmit}>Send</button>
        </div>
      </form>
    </div>
  );
}

TextChannel.propTypes = {
  // eslint-disable-next-line
  chatLogs: PropTypes.object.isRequired,
  // eslint-disable-next-line
  user: PropTypes.object.isRequired,
  textChannelId: PropTypes.string.isRequired,
  sendMessage: PropTypes.func.isRequired,
  setChatLogs: PropTypes.func.isRequired,
};
