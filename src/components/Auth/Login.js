import React, { Component } from 'react'
import firebase from '../../firebase'
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

export default class Login extends Component {
  state = {
    email: '',
    password: '',
    errors: [],
    loading: false
  }
  changeHandler = event => {
    this.setState({
      [event.target.name]: event.target.value
    })
  }

  submitHandler = event => {
    if (this.isFormValid(this.state)) {
      event.preventDefault()
      this.setState({ errors: [], loading: true })
      firebase
        .auth()
        .signInWithEmailAndPassword(this.state.email, this.state.password)
        .then(signedinUser => {
          console.log(signedinUser)
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
  isFormValid = ({ email, password }) => email && password

  displayErrors = errors =>
    errors.map((error, i) => <p key={i}> {error.message} </p>)

  inputErrorHandler = (errors, inputType) => {
    return errors.some(error => error.message.toLowerCase().includes(inputType))
      ? 'error'
      : ''
  }

  render () {
    const { email, password, errors, loading } = this.state
    return (
      <Grid textAlign='center' verticalAlign='middle' className='app'>
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as='h1' icon color='blue' textAlign='center'>
            <Icon name='sign in' color='blue' />
            Login to Chat - App
          </Header>
          <Form onSubmit={this.submitHandler} size='large'>
            <Segment stacked>
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
              <Button
                disabled={loading}
                className={loading ? 'loading' : ''}
                color='green'
                fluid
                size='large'
              >
                Login
              </Button>
            </Segment>
          </Form>
          {errors.length > 0 && (
            <Message error>
              <h3> Error </h3> {this.displayErrors(errors)}
            </Message>
          )}
          <Message>
            Need an account ? <Link to='/register'> Register </Link>
          </Message>
        </Grid.Column>
      </Grid>
    )
  }
}
