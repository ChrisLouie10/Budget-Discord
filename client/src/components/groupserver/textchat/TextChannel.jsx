import React, {
  useState, useEffect, useContext, useMemo,
} from 'react';
import { useParams } from 'react-router-dom';
import { Context } from '../../../contexts/Store';
import { ChatLogsContext } from '../../../contexts/chatLogs-context';
import { UserContext } from '../../../contexts/user-context';
import Loading from '../../Loading';

export default function TextChannel() {
  const [state, setState] = useContext(Context);
  const [chatLogs, setChatLogs] = useContext(ChatLogsContext);
  const [user, setUser] = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const { groupServerId, textChannelId } = useParams();

  // Repeatedly attempts to contact ws server with "callback" until ws server is online
  function waitForWSConnection(callback, interval) {
    const { ws } = state;
    if (ws) {
      if (ws.readyState === WebSocket.OPEN) callback();
      else {
        setTimeout(() => {
          waitForWSConnection(callback, interval);
        }, interval);
      }
    }
  }

  function sendMessage(message) {
    const { ws } = state;
    // Create data
    const data = {
      type: 'message',
      textChannelId,
      serverId: groupServerId,
      message,
    };
    // Send data over to ws server
    waitForWSConnection(() => {
      ws.send(JSON.stringify(data));
    }, 500);
  }

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
    setLoading(false);
  }, [textChannelId]);

  function handleChatBoxSubmit(e) {
    e.preventDefault();
    if (input !== '') {
      const message = {
        content: input,
        index: Object.keys(chatLogs).length + 1,
        author: user.name,
        timestamp: new Date(),
        notSent: true,
      };
      // update client chatlogs
      const _chatLogs = { ...chatLogs };
      _chatLogs[textChannelId].push(message);
      setChatLogs(_chatLogs);
      // update server chatlogs
      sendMessage(message);
      setInput('');
    }
  }

  function handleChatBoxChange(e) {
    setInput(e.target.value);
  }

  // Displays messages
  // If a message is not "sent" then it will be displayed with a dark gray color
  // Otherwise, sent messages will be light gray
  const displayChat = useMemo(() => {
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
    } return <div />;
  }, [chatLogs]);

  if (loading) return <Loading />;
  return (
    <div className="col-10 align-self-end w-100" style={{ minHeight: '100vh', background: '#303030' }}>
      {displayChat}
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
