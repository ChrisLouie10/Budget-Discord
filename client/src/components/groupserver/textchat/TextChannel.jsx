import React, {
  useState, useEffect, useContext, useMemo,
} from 'react';
import { useParams } from 'react-router-dom';
import { Context } from '../../../contexts/Store';
import { ChatLogsContext } from '../../../contexts/chatLogs-context';
import { GroupServersContext } from '../../../contexts/groupServers-context';
import { PendingMessagesContext } from '../../../contexts/pendingMessages-context';
import { UserContext } from '../../../contexts/user-context';
import Loading from '../../Loading';

export default function TextChannel() {
  const [state, setState] = useContext(Context);
  const [user, setUser] = useContext(UserContext);
  const [groupServers, setGroupServers] = useContext(GroupServersContext);
  const [chatLogs, setChatLogs] = useContext(ChatLogsContext);
  const [pendingMessages, setPendingMessages] = useContext(PendingMessagesContext);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const { groupServerId, textChannelId } = useParams();

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

  function sendMessage(message) {
    state.ws.send(JSON.stringify({
      method: 'message',
      textChannelId,
      groupServerId,
      message,
    }));
  }

  function handleChatBoxSubmit(e) {
    e.preventDefault();
    if (input !== '') {
      const message = {
        content: input,
        author: user._id,
        timestamp: new Date(),
      };
      // update client chatlogs
      const _pendingMessages = { ...pendingMessages };
      if (_pendingMessages[textChannelId]) {
        _pendingMessages[textChannelId].push(message);
      } else _pendingMessages[textChannelId] = [message];
      setPendingMessages(_pendingMessages);
      // update server chatlogs
      sendMessage(message);
      setInput('');
    }
  }

  function handleChatBoxChange(e) {
    setInput(e.target.value);
  }

  function displayPendingMessages() { // If a message is not "sent" then it will be displayed with a dark gray color
    if (pendingMessages[textChannelId]) {
      return Object.entries(pendingMessages[textChannelId]).map(([key, value]) => {
        const author = groupServers[groupServerId].users[value.author];
        return (
          <p className="ml-2 #858585" key={key}>
            {author ? author.name : value.author}
            {' '}
            (
            {new Date(value.timestamp).toLocaleString()}
            ):
            <br />
            {value.content}
          </p>
        );
      });
    } return <></>;
  }

  const displayChat = useMemo(() => { // Sent messages will be a lighter gray
    if (chatLogs[textChannelId]) {
      return (
        <div className="row">
          <div className="col-12" aria-orientation="vertical" style={{ height: '100%', position: 'absolute', overflowY: 'scroll' }}>
            { Object.entries(chatLogs[textChannelId]).map(([key, value]) => {
              const author = groupServers[groupServerId].users[value.author];
              return (
                <p className="ml-2" style={{ color: '#c2c2c2' }} key={key}>
                  {author ? author.name : value.name}
                  {' '}
                  (
                  {new Date(value.timestamp).toLocaleString()}
                  ):
                  <br />
                  {value.content}
                </p>
              );
            })}
            { displayPendingMessages() }
          </div>
        </div>
      );
    } return <div />;
  }, [chatLogs, pendingMessages, textChannelId]);

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
