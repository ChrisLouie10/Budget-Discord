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

  function sendMessage(message) {
    state.ws.send(JSON.stringify({
      method: 'message',
      textChannelId,
      groupServerId,
      message,
    }));
  }

  useEffect(async () => {
    // If the chat log for the text channel with the id "props.textChannelId"
    // doesn't exist in the client, then retrieve it from the server
    if (!chatLogs[textChannelId]) {
      await fetch(`/api/group-servers/${groupServerId}/text-channels/${textChannelId}/chat-logs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(async (response) => {
          const data = await response.json();
          if (response.status === 200) {
            const _chatLogs = { ...chatLogs };
            _chatLogs[textChannelId] = data.chatLog;
            setChatLogs(_chatLogs);
          } else console.error(data.message);
        });
    }
    setLoading(false);
  }, [textChannelId]);

  function handleChatBoxSubmit(e) {
    e.preventDefault();
    if (input !== '') {
      const message = {
        content: input,
        author: user._id,
        timestamp: new Date(),
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
  }, [chatLogs, textChannelId]);

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
