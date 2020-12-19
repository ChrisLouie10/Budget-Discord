import React, { Component } from 'react';
import Navbar from './components/navbar.jsx';
import ChatDisplay from './components/chatDisplay.jsx';

class App extends Component {
  state = {  }
  render() { 
    return (
      <div>
        <Navbar />
        <ChatDisplay />
      </div>
    );
  };
};
 
export default App;
