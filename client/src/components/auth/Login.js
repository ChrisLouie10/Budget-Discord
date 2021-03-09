import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Link, useHistory } from "react-router-dom";

// Simple Login page

export default function Login() {
  const history = useHistory();
  const { control, handleSubmit, errors } = useForm();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function onSubmit(data){
    if (!loading){
      setLoading(true);
      setError('');
      fetch('/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password
        })
      }).then(response => {
        return response.json()})
        .then((data) => {
          if(data.success){
            localStorage.setItem('Authorization', data.Authorization);
            history.push("/dashboard");
          } else {
            setError(data.error.login);
            setLoading(false);
          }
        })
    }
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.loginForm}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Log In</Text>
        </View>
        <View style={styles.mainContent}>
          <View style={styles.input}>
            {errors.email && errors.email.type === 'required' && (
              <Text style={styles.error}>Please enter your email</Text>
            )}
            {errors.email && errors.email.type === 'maxLength' && (
              <Text style={styles.error}>Email must be 64 characters or less</Text>
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
                  autoCompleteType='email'
                  autoCorrect={false}
                  onSubmitEditing={handleSubmit(onSubmit)}
                />
              )}
              name="email"
              rules={{ required: true, maxLength: 64 }}
              defaultValue=""
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
                    autoCompleteType='password'
                    autoCorrect={false}
                    secureTextEntry={true}
                    onSubmitEditing={handleSubmit(onSubmit)}
                  />
                )}
                name="password"
                rules={{ required: true, minLength: 10, maxLength: 32 }}
                defaultValue=""
              />
          </View>
        </View>
        <View style={styles.bottomSection}>
          <TouchableOpacity  style={styles.button} onPress={handleSubmit(onSubmit)} type='submit'>
              <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.signup}>Need an account? <Link to="/signup">Sign Up</Link></Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh'
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#009dff',
    borderColor: '#009dff',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 5,
    justifyContent: 'center',
    marginLeft: 39,
    height: 45,
    width: 90
  },
  buttonText: {
    fontSize: 16,
    color: '#fff'
  },
  error: {
    color: '#ff0000',
    alignSelf: 'flex-start',
    paddingLeft: '10%'
  },
  loginForm: {
    width: 400,
    height: 325,
    borderColor: '#dbdbdb',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 5
  },
  header: {
    flex: .25,
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 30
  },
  mainContent: {
    flex: .5,
    alignItems: 'center',
  },
  bottomSection: {
    flex: .25,
    justifyContent: 'center'
  },
  input: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  signup: {
    paddingTop: 10,
    fontSize: 15
  },
  textInput: {
    height: 50,
    width: '80%',
    borderColor: '#dbdbdb',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 5,
    paddingHorizontal: 10
  }
});