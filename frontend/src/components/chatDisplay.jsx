import React, { Component } from 'react';
import ChatBox from './chatBox.jsx';

class ChatDisplay extends Component {
    state = { 
        messages: []
    };
   
    updateMessages = (input) => {
       //First clone the current messages array
       let messages = [...this.state.messages];

       //If this is the first message then create the first map
       //and push it into the messages array
       if (messages.length === 0){
            const message = {input: input, id: 1, author: "Stephen"};
            messages.push(message);
       }

       //Otherwise use the last element of the messages array 
       //to create a new id
       else{
           const message = {input: input, id: messages[messages.length-1].id + 1, author: "Stephen"};
           messages.push(message);
       }

       this.setState({ messages });
    }

    displayChat = () => {
        //Display the messages array
        return(
            <div>
                {this.state.messages.map(message => (
                    <p key={message.id}>{message.author}: {message.input}</p>
                ))}
            </div>
        );
    };

    render() { 
        return (
            <div>
                {this.displayChat()}
                <ChatBox action={this.updateMessages}/>
            </div>
        );
    }
}
 
export default ChatDisplay;