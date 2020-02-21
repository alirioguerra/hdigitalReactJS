import React from 'react'
import { withFirebase } from '../Firebase'

const SignOutButton = ({ firebase }) => (
  <button
    className={'btn btn-signout'}
    type="button"
    onClick={firebase.doSignOut}>
    Sair
  </button>
)

export default withFirebase(SignOutButton)
