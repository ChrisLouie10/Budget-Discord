import React, { useState, useEffect } from 'react';

export default function TextChatBox(props){
    const [input, setInput] = useState("");

    //When Enter key is pressed on the input,
    //the data is sent to ChatDisplay
    //and the input is cleared
    const handleEnterPress = (e) => {
        if (e.key == "Enter"){
            //Bubble up the new message to ChatDisplay.js
            const timestamp = new Date();
            props.sendMessage(e.target.value, timestamp.toString());
            setInput("");
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input === "")
            return;
        const timestamp = new Date();
        props.sendMessage(input, timestamp.toString());
        setInput("");
    }

    const handleInputChange = (e) => {
        setInput(e.target.value);
    };

    return (  
        <form className="w-75 mb-2" style={{position: "absolute", bottom: "0"}}>
            <div className="form-row" >
                <div className="col">
                    <input type="text" className="form-control " id="chatBox" value={input} onChange={handleInputChange} />
                </div>
                <button type="submit" className="btn btn-primary" onClick={handleSubmit}>Send</button>
            </div>
        </form>
    );
}