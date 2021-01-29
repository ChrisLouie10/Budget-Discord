import React, { useState, useEffect } from 'react';

export default function TextChannel(props){

  const [input, setInput] = useState("");

  function handleChatBoxSubmit(e){
    e.preventDefault();
    if (input !== ""){
        const timestamp = new Date();
        props.sendMessage(input, timestamp.toUTCString(), Object.keys(props.chatLog).length);
        setInput("");
    }
  }

  function handleChatBoxChange(e){
      setInput(e.target.value);
  };

  function displayChat(){
    if (props.chatLog){
        return(
          <div className="row">
              <div className="col-12" aria-orientation="vertical" style={{height: "100%", position: "absolute", overflowY: "scroll"}}>
              {
                Object.entries(props.chatLog).map(([key, value]) => {
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