import React, {useState, useEffect} from "react";

export default function RightClickMenu(props){

    const {open} = props;
    
    return(
        <>
            {
                open ?
                <div className="dropdown" style={{position: "absolute", top: "58px", width: "300px",  padding: "1rem", backgroundColor: "var(--bg)", border: "var(--border)", borderRadius: "var(--border-radius)"}}>
                    {props.children}
                </div>
                :
                <></>
            }
        </>
    );
}