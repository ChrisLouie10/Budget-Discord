import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Link, useHistory } from 'react-router-dom';

// Simple Signup page

export default function Signup() {
  const history = useHistory();
  const { watch, control, handleSubmit, errors } = useForm();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  function onSubmit(data){
    if(data.password !== data.confirmPassword){
      return setError('Passwords do not match');
    }
    setError('');
    setLoading(true);
    try{
      fetch('/api/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password
        })
      }).then(response => { return response.json()})
        .then(data => {
        if(!data.success) {
          setError(data.message);
          console.log(data.message);
        }
        else {
          localStorage.setItem('Authorization', data.Authentication);
          history.push("/dashboard");
        }
      });
    }
    finally{
      setLoading(false);
    }
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.signupForm}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Sign Up</Text>
        </View>
        <View style={styles.mainContent}>
          <View style={styles.input}>
            {errors.name && errors.name.type === 'required' && (
              <Text style={styles.error}>Please enter your name</Text>
            )}
            {errors.name && errors.name.type === 'maxLength' && (
              <Text style={styles.error}>The entered name is too long</Text>
            )}
            <Controller 
              control={control}
              render={(props) => (
                <TextInput 
                  style={styles.textInput}
                  onBlur={props.onBlur}
                  onChange={props.onChange}
                  value={props.value}
                  ref={props.ref}
                  placeholder='Name'
                  textContentType='name'
                  autoCapitalize='none'
                  autoCorrect={false}
                  onSubmitEditing={handleSubmit(onSubmit)}
                />
              )}
              name='name'
              rules={{required: true, maxLength: 32}}
              defaultValue=''
            />
          </View>
          <View style={styles.input}>
            {errors.email && errors.email.type === 'required' && (
              <Text style={styles.error}>Please enter your email</Text>
            )}
            {errors.email && errors.email.type === 'maxLength' && (
              <Text style={styles.error}>Email must be 64 characters or less</Text>
            )}
            {errors.email && errors.email.type === 'pattern' && (
              <Text style={styles.error}>Please enter a valid email</Text>
            )}
            <Controller 
              control={control}
              render={(props) => (
                <TextInput 
                  style={styles.textInput}
                  onBlur={props.onBlur}
                  onChange={props.onChange}
                  value={props.value}
                  ref={props.ref}
                  placeholder='Email'
                  textContentType='emailAddress'
                  autoCapitalize='none'
                  autoCorrect={false}
                  onSubmitEditing={handleSubmit(onSubmit)}
                />
              )}
              name='email'
              rules={{required: true, maxLength: 64, pattern: /\S+@\S+\.\S+/ }}
              defaultValue=''
            />
          </View>
          <View style={styles.input}>
            {errors.password && errors.password.type === 'required' && (
              <Text style={styles.error}>Please enter your password</Text>
            )}
            {errors.password && errors.password.type === 'minLength' && (
              <Text style={styles.error}>Password must be at least 10 characters</Text>
            )}
            {errors.password && errors.password.type === 'maxLength' && (
              <Text style={styles.error}>Password must be 32 characters or less</Text>
            )}
            <Controller 
              control={control}
              render={(props) => (
                <TextInput 
                  style={styles.textInput}
                  onBlur={props.onBlur}
                  onChange={props.onChange}
                  value={props.value}
                  ref={props.ref}
                  placeholder='Password'
                  textContentType='password'
                  autoCapitalize='none'
                  autoCorrect={false}
                  secureTextEntry={true}
                  onSubmitEditing={handleSubmit(onSubmit)}
                />
              )}
              name='password'
              rules={{required: true, minLength: 10, maxLength: 32}}
              defaultValue=''
            />
          </View>
          <View style={styles.input}>
            {errors.confirmPassword && errors.confirmPassword.type === 'required' && (
              <Text style={styles.error}>Please re-enter your password</Text>
            )}
            {errors.confirmPassword && errors.confirmPassword.type === 'validate' && (
              <Text style={styles.error}>Passwords do not match</Text>
            )}
            <Controller 
              control={control}
              render={(props) => (
                <TextInput 
                  style={styles.textInput}
                  onBlur={props.onBlur}
                  onChange={props.onChange}
                  value={props.value}
                  ref={props.ref}
                  placeholder='Confirm Password'
                  textContentType='password'
                  autoCapitalize='none'
                  autoCorrect={false}
                  secureTextEntry={true}
                  onSubmitEditing={handleSubmit(onSubmit)}
                />
              )}
              name='confirmPassword'
              rules={{required: true, validate: value => value === watch('password')}}
              defaultValue=''
            />
          </View>
        </View>
        <View style={styles.bottomSection}>
          <TouchableOpacity  style={styles.button} onPress={handleSubmit(onSubmit)} type='submit'>
              <Text style={styles.buttonText}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.login}>Already have an account? <Link to="/login">Log In</Link></Text>
    </View>
  )
}

/*
<div className="container d-flex align-items-center justify-content-center"
        style={{minHeight: "100vh"}}>
      <div className="w-100" style={{maxWidth: "400px"}}>
        <div className="card">
          <div className="card-body">
            <div className="card-header text-center mb-4">
              <h2>Sign Up</h2>
            </div>
            {error && <div className="alert alert-danger" role="alert">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3" id="name">
              <label htmlFor="input-name">Name</label>
                <input type="name" className="form-control" id="input-name" ref={nameRef} required></input>
              </div>
              <div className="mb-3" id="email">
              <label htmlFor="input-email">Email</label>
                <input type="email" className="form-control" id="input-email" ref={emailRef} required></input>
              </div>
              <div className="mb-3" id="password">
              <label htmlFor="input-password">Password</label>
                <input className="form-control" type="password" id="input-password" ref={passwordRef} required></input>
              </div>
              <div className="mb-3" id="password-confirm">
              <label htmlFor="input-password-confirm">Confirm Password</label>
                <input className="form-control" type="password" id="input-password-confirm" ref={passwordConfirmRef} required></input>
              </div>
              <button disabled={loading} className="btn btn-primary w-25" type="Submit">Submit</button>
            </form>
          </div>
        </div>
        <div className="w-100 text-center mt-2">
          Already have an account? <Link to="/login">Log In</Link>
        </div>
      </div>
    </div>
*/

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh'
  },
  bottomSection: {
    flex: .15,
    justifyContent: 'center',
    alignItems: 'center'
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#009dff',
    borderColor: '#009dff',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: '0.25rem',
    justifyContent: 'center',
    height: '3rem',
    paddingLeft: '1rem',
    paddingRight: '1rem'
  },
  buttonText: {
    fontSize: '1rem',
    color: '#fff'
  },
  error: {
    color: '#ff0000',
    alignSelf: 'flex-start',
    paddingLeft: '10%'
  },
  header: {
    flex: .15,
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: '2rem'
  },
  mainContent: {
    flex: .7,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  login: {
    paddingTop: '1rem',
    fontSize: '.9rem'
  },
  signupForm: {
    width: '25rem',
    height: '30rem',
    borderColor: '#dbdbdb',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: '.25rem'
  },
  textInput: {
    height: '3rem',
    width: '80%',
    borderColor: '#dbdbdb',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: '.25rem',
    paddingLeft: '.66rem'
  }
});