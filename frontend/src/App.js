import React, { Component } from 'react';
import Navbar from './components/navbar.jsx';
import ChatDisplay from './components/chatDisplay.jsx';
import axios from 'axios';

class App extends Component {
  state = { 
    messages: [] 
  };

  componentDidMount = () => {
    axios.get("/getChatLogs").then(response => {
      console.log(response.data);
      if (response.data){
        let messages = [...this.state.messages];
        for (let i = 0; i < response.data.length; i++){
          messages.push(response.data[i]);
        }
        this.setState({ messages });
      }
    });
  };

  updateMessages = (input, timestamp) => {
    ////First clone the messages array from the state
    let messages = [...this.state.messages];
    let message;

    //If this is the first message then create the first map
    //and push it into the messages array
    if (messages.length === 0){
      message = {input: input, id: 1, author: "Stephen", timestamp: timestamp};
      messages.push(message);
    }

    //Otherwise use the last element of the messages array 
    //to create a new id
    else{
      message = {input: input, id: messages[messages.length-1].id + 1, author: "Stephen", timestamp: timestamp};
      messages.push(message);
    }

    this.setState({ messages });
    axios.post("http://localhost:3000/", message)
    .then(() => console.log("Testing...")).
    catch(err => {
      console.error(err);
    });
  };

  render() { 
    return (
      <div>
        <Navbar />
        <ChatDisplay updateMessages={this.updateMessages} messages={this.state.messages}/>
      </div>
    );
  };  
};
 
export default App;
