import React, { useState, useEffect } from 'react';

export default function TextChannel(props){

  const [input, setInput] = useState("");

  useEffect(async ()=>{
    //If the chat log for the text channel with the id "props.textChannelId"
    //doesn't exist in the client, then retrieve it from the server
    if (!props.chatLogs[props.textChannelId]){
      await fetch('/api/groupServer/get-chat-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'get-chat-log',
          userId: props.user._id,
          textChannelId: props.textChannelId
        })
      })
        .then(response => { return response.json(); })
          .then((data) => {
            let chatLogs = {...props.chatLogs};
            chatLogs[props.textChannelId] = data.chatLog; 
            props.setChatLogs(chatLogs);
          });
    }
  }, [props.textChannelId]);

  function handleChatBoxSubmit(e){
    e.preventDefault();
    //Check whether input is not just an empty string
    if (input !== ""){
        //Create a message object
        const message = {
          content: input,
          index: Object.keys(props.chatLogs).length + 1,
          author: props.user.name,
          timestamp: new Date(),
          notSent: true
        }
        //Send the message object over to client
        props.chatLogs[props.textChannelId].push(message);
        //Send the message object over to the server
        props.sendMessage(message);
        //Clear chat box
        setInput("");
    }
  }

  function handleChatBoxChange(e){
      setInput(e.target.value);
  };

  //Displays messages
  //If a message is not "sent" then it will be displayed with a dark gray color
  //Otherwise, sent messages will be light gray
  function displayChat(){
    if (props.chatLogs[props.textChannelId]){
        return(
          <div className="row">
              <div className="col-12" aria-orientation="vertical" style={{height: "100%", position: "absolute", overflowY: "scroll"}}>
              {
                Object.entries(props.chatLogs[props.textChannelId]).map(([key, value]) => {
                  if (value.notSent){
                    return(
                      <p className="ml-2 #858585" key={key}>
                        {value.author} ({new Date(value.timestamp).toLocaleString()}):<br />{value.content}
                      </p>
                    );
                  }
                  else{
                    return(
                      <p className="ml-2" style={{color: "#c2c2c2"}} key={key}>
                        {value.author} ({new Date(value.timestamp).toLocaleString()}):<br />{value.content}
                      </p>
                    );
                  }
                })
              }
              </div>
          </div>
      );
    }
  };

  return (
    <div className="col-10 align-self-end w-100" style={{minHeight: "100vh", background: "#303030"}}>
        {displayChat()}
        <form className="w-75 mb-2" style={{position: "absolute", bottom: "0"}}>
            <div className="form-row" >
                <div className="col">
                    <input type="text" className="form-control " id="chatBox" value={input} onChange={handleChatBoxChange} />
                </div>
                <button type="submit" className="btn btn-primary" onClick={handleChatBoxSubmit}>Send</button>
            </div>
        </form>
    </div>
  );
};