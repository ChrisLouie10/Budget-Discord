import React, {
  useState, useEffect, useContext, useMemo,
} from 'react';
import { useParams } from 'react-router-dom';
import { Context } from '../../../contexts/Store';
import { ChatLogsContext } from '../../../contexts/chatLogs-context';
import { PendingMessagesContext } from '../../../contexts/pendingMessages-context';
import { UserContext } from '../../../contexts/user-context';
import Loading from '../../Loading';

export default function PrivateChat() {
  const [state, setState] = useContext(Context);
  const [user, setUser] = useContext(UserContext);
  const [chatLogs, setChatLogs] = useContext(ChatLogsContext);
  const [pendingMessages, setPendingMessages] = useContext(PendingMessagesContext);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const { privateChatId } = useParams();

  useEffect(async () => {
    // If the chat log for the text channel with the id "props.privateChatId"
    // doesn't exist in the client, then retrieve it from the server
    if (!chatLogs[privateChatId]) {
      await fetch(`/api/private-chat/${privateChatId}/chat-logs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(async (response) => {
          const data = await response.json();
          if (response.status === 200) {
            const _chatLogs = { ...chatLogs };
            _chatLogs[privateChatId] = data.chatLog;
            setChatLogs(_chatLogs);
          } else console.error(data.message);
        });
    }
    setLoading(false);
  }, [privateChatId]);

  function sendMessage(message) {
    state.ws.send(JSON.stringify({
      method: 'message',
      privateChatId,
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
      if (_pendingMessages[privateChatId]) {
        _pendingMessages[privateChatId].push(message);
      } else _pendingMessages[privateChatId] = [message];
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
    if (pendingMessages[privateChatId]) {
      return Object.entries(pendingMessages[privateChatId]).map(([key, value]) => (
        <p className="ml-2 #858585" key={key}>
          {value.author}
          {' '}
          (
          {new Date(value.timestamp).toLocaleString()}
          ):
          <br />
          {value.content}
        </p>
      ));
    } return <></>;
  }

  const displayChat = useMemo(() => { // Sent messages will be a lighter gray
    if (chatLogs[privateChatId]) {
      return (
        <div className="row">
          <div className="col-12" aria-orientation="vertical" style={{ height: '100%', position: 'absolute', overflowY: 'scroll' }}>
            { Object.entries(chatLogs[privateChatId]).map(([key, value]) => (
              <p className="ml-2" style={{ color: '#c2c2c2' }} key={key}>
                {value.author}
                {' '}
                (
                {new Date(value.timestamp).toLocaleString()}
                ):
                <br />
                {value.content}
              </p>
            ))}
            { displayPendingMessages() }
          </div>
        </div>
      );
    } return <div />;
  }, [chatLogs, pendingMessages, privateChatId]);

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
