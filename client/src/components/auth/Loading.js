import React from 'react';

export default function Loading() {

  return (
    <div className="d-flex justify-content-center align-items-center flex-column" style={{height: "100vh"}}>
      <h1>Loading...</h1>
      <div className="spinner-border" 
        style={{width: "20rem", height: "20rem"}} 
        role="status">
          <span className="sr-only">Loading...</span>
      </div>
    </div>
  )
}
