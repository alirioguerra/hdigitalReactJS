import React, { Component } from 'react'
import { Link, withRouter } from 'react-router-dom'
import { withFirebase } from '../Firebase'
import { withAuthorization } from '../Session'
import { compose } from 'recompose'
import * as ROUTES from '../constants/routes'
import * as ROLES from '../constants/roles'

const SignUpPage = () => (
  <div className={'one-col'}>
    <SignUpForm />
  </div>
)
const initialState = {
  username: '',
  email: '',
  passwordOne: '',
  passwordTwo: '',
  error: null,
  err: '',
  isAdmin: false
}
class SignUpFormBase extends Component {
  constructor(props) {
    super(props)

    this.state = {
      ...initialState
    }
  }

  onChangeCheckbox = event => {
    this.setState({ [event.target.name]: event.target.checked })
  }

  onSubmit = event => {
    const { username, email, passwordOne, isAdmin } = this.state
    const roles = {}
    if (isAdmin) {
      roles[ROLES.ADMIN] = ROLES.ADMIN
    }
    this.props.firebase
      .doCreateUserWithEmailAndPassword(email, passwordOne)
      .then(authUser => {
        // Create a user in your Firebase realtime database
        return this.props.firebase.user(authUser.user.uid).set({
          name: username,
          email,
          roles
        })
      })
      .then(() => {
        this.setState({ ...initialState })
        this.props.history.push(ROUTES.HOME)
      })
      .catch(error => {
        this.setState({ error })
      })

    event.preventDefault()
  }

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value })
  }

  render() {
    const {
      username,
      email,
      passwordOne,
      passwordTwo,
      error,
      isAdmin
    } = this.state
    const isInvalid =
      passwordOne !== passwordTwo ||
      passwordOne === '' ||
      email === '' ||
      username === ''

    return (
      <form className={'form-box'} onSubmit={this.onSubmit}>
        <h1>Criar conta</h1>
        <input
          name="username"
          value={username}
          onChange={this.onChange}
          type="text"
          placeholder="Full Name"
        />
        <input
          name="email"
          value={email}
          onChange={this.onChange}
          type="text"
          placeholder="Email Address"
        />
        <input
          name="passwordOne"
          value={passwordOne}
          onChange={this.onChange}
          type="password"
          placeholder="Password"
        />
        <input
          name="passwordTwo"
          value={passwordTwo}
          onChange={this.onChange}
          type="password"
          placeholder="Confirm Password"
        />
        <label>
          conta de colaborador:
          <input
            name="isAdmin"
            type="checkbox"
            checked={isAdmin}
            onChange={this.onChangeCheckbox}
          />
        </label>
        <button className={'btn btn-add'} disabled={isInvalid} type="submit">
          Cadastrar
        </button>
        {error && <p>{error.message}</p>}
        <p>{this.state.err}</p>
      </form>
    )
  }
}

const SignUpLink = () => (
  <p>
    <Link to={ROUTES.SIGN_UP}>Criar conta</Link>
  </p>
)

const condition = authUser => !!authUser && !!authUser.roles[ROLES.ADMIN]

const SignUpForm = compose(
  withAuthorization(condition),
  withRouter,
  withFirebase
)(SignUpFormBase)

export default SignUpPage
export { SignUpForm, SignUpLink }
