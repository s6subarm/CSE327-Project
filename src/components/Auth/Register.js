import React, { Component } from 'react'
import firebase from '../../firebase'
import md5 from 'md5'
import {
  Grid,
  Form,
  Segment,
  Button,
  Header,
  Message,
  Icon
} from 'semantic-ui-react'
import { Link } from 'react-router-dom'

export default class Register extends Component {
  state = {
    username: '',
    email: '',
    password: '',
    retypepassword: '',
    errors: [],
    loading: false,
    userRef: firebase.database().ref('user')
  }
  changeHandler = event => {
    this.setState({
      [event.target.name]: event.target.value
    })
  }

  submitHandler = event => {
    if (this.isFormValid()) {
      event.preventDefault()
      this.setState({ errors: [], loading: true })

      firebase
        .auth()
        .createUserWithEmailAndPassword(this.state.email, this.state.password)
        .then(createUser => {
          console.log(createUser)
          createUser.user
            .updateProfile({
              displayName: this.state.username,
              photoURL: `http://gravatar.com/avatar/${md5(
                createUser.user.email
              )}?d=identicon`
            })
            .then(() => {
              this.saveUser(createUser).then(() => {
                console.log('User Saved')
              })
              this.setState({ loading: false })
            })
            .catch(err => {
              console.error(err)
              this.setState({
                errors: this.state.errors.concat(err),
                loading: false
              })
            })
        })
        .catch(err => {
          console.error(err)
          this.setState({
            errors: this.state.errors.concat(err),
            loading: false
          })
        })
    }
  }

  isFormValid = () => {
    let errors = []
    let error

    if (this.isformEmpty(this.state)) {
      // throw error
      error = { message: 'Fill in all fields' }
      this.setState({
        errors: errors.concat(error)
      })
      return false
    } else if (!this.isPasswordValid(this.state)) {
      // throw error
      error = { message: 'Password Invalid' }
      this.setState({
        errors: errors.concat(error)
      })
      return false
    } else {
      // form valid
      return true
    }
  }

  displayErrors = errors =>
    errors.map((error, i) => <p key={i}>{error.message}</p>)

  isformEmpty = ({ username, email, password, retypepassword }) => {
    return (
      !username.length ||
      !email.length ||
      !password.length ||
      !retypepassword.length
    )
  }
  isPasswordValid = ({ password, retypepassword }) => {
    if (password.length < 6 || retypepassword < 6) {
      return false
    } else if (password.length !== retypepassword.length) {
      return false
    } else {
      return true
    }
  }

  inputErrorHandler = (errors, inputType) => {
    return errors.some(error => error.message.toLowerCase().includes(inputType))
      ? 'error'
      : ''
  }

  saveUser = createuser => {
    return this.state.userRef.child(createuser.user.uid).set({
      name: createuser.user.displayName,
      avatar: createuser.user.photoURL
    })
  }

  render () {
    const {
      username,
      email,
      password,
      retypepassword,
      errors,
      loading
    } = this.state
    return (
      <Grid textAlign='center' verticalAlign='middle' className='app'>
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as='h1' icon color='blue' textAlign='center'>
            <Icon name='signup' color='blue' />
            Register For Chat - App
          </Header>
          <Form onSubmit={this.submitHandler} size='large'>
            <Segment stacked>
              <Form.Input
                fluid
                name='username'
                icon='user'
                iconPosition='left'
                placeholder='Username'
                onChange={this.changeHandler}
                value={username}
                type='text'
              />
              <Form.Input
                fluid
                name='email'
                icon='mail'
                iconPosition='left'
                placeholder='Email'
                onChange={this.changeHandler}
                value={email}
                className={this.inputErrorHandler(errors, 'email')}
                type='email'
              />
              <Form.Input
                fluid
                name='password'
                icon='lock'
                iconPosition='left'
                placeholder='Password'
                onChange={this.changeHandler}
                value={password}
                className={this.inputErrorHandler(errors, 'password')}
                type='password'
              />
              <Form.Input
                fluid
                name='retypepassword'
                icon='repeat'
                iconPosition='left'
                placeholder='Re-Type Your Password'
                onChange={this.changeHandler}
                value={retypepassword}
                className={this.inputErrorHandler(errors, 'password')}
                type='password'
              />
              <Button
                disabled={loading}
                className={loading ? 'loading' : ''}
                color='green'
                fluid
                size='large'
              >
                Register
              </Button>
            </Segment>
          </Form>
          {errors.length > 0 && (
            <Message error>
              <h3>Error</h3>
              {this.displayErrors(errors)}
            </Message>
          )}
          <Message>
            Already an User ? <Link to='/login'> Login </Link>
          </Message>
        </Grid.Column>
      </Grid>
    )
  }
}
