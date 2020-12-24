import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.css';
import Chat from './components/chat.js';

ReactDOM.render(
  <React.StrictMode>
    <Chat />
  </React.StrictMode>,
  document.getElementById('root')
);