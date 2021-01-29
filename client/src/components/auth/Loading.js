import React from 'react';

export default function Loading() {

  return (
    <div className="d-flex justify-content-center align-items-center flex-column bg-secondary" style={{height: "100vh"}}>
      <h1 className="text-light">Loading...</h1>
      <div className="spinner-border" 
        style={{width: "20rem", height: "20rem", color: "whitesmoke"}} 
        role="status">
          <span className="sr-only">Loading...</span>
      </div>
    </div>
  )
}
