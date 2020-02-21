import React, { Component } from 'react'

import { withFirebase } from '../Firebase'

const INITIAL_STATE = {
  passwordOne: '',
  passwordTwo: '',
  error: null
}

class PasswordChangeForm extends Component {
  constructor(props) {
    super(props)

    this.state = { ...INITIAL_STATE }
  }

  onSubmit = event => {
    const { passwordOne } = this.state

    this.props.firebase
      .doPasswordUpdate(passwordOne)
      .then(() => {
        this.setState({ ...INITIAL_STATE })
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
    const { passwordOne, passwordTwo, error } = this.state

    const isInvalid = passwordOne !== passwordTwo || passwordOne === ''

    return (
      <div className={'one-col'}>
        <form className={'form-box'} onSubmit={this.onSubmit}>
          <h2>Trocar senha</h2>
          <input
            name="passwordOne"
            value={passwordOne}
            onChange={this.onChange}
            type="password"
            placeholder="Nova Senha"
          />
          <input
            name="passwordTwo"
            value={passwordTwo}
            onChange={this.onChange}
            type="password"
            placeholder="Confimar nova senha"
          />
          <button className={'btn btn-add'} disabled={isInvalid} type="submit">
            Recuperar
          </button>

          {error && <p>{error.message}</p>}
        </form>
      </div>
    )
  }
}

export default withFirebase(PasswordChangeForm)
