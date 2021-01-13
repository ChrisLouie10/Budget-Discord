
import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import verify from '../../contexts/verifyUser';
export default function PrivateRoute({ component: Component, ...rest}) {

  return (
    <Route
      {...rest}
      render={props =>{
        return verify() ? <Component {...props}/> : <Redirect to="/login" />
      }}
    ></Route>
  )
}
