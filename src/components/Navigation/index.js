import React from 'react'
import { Link } from 'react-router-dom'
import SignOutButton from '../SignOut'
import * as ROUTES from '../constants/routes'
import * as ROLES from '../constants/roles'
import { AuthUserContext } from '../Session'
import './style.css'

const Navigation = () => (
  <AuthUserContext.Consumer>
    {authUser =>
      authUser ? <NavigationAuth authUser={authUser} /> : <NavigationNonAuth />
    }
  </AuthUserContext.Consumer>
)

const NavigationAuth = ({ authUser }) => (
  <ul className={'menu'}>
    {!!authUser.roles[ROLES.ADMIN] && (
      <li>
        <Link to={ROUTES.HOME}>Dashboard</Link>
      </li>
    )}
    <li>
      <Link to={ROUTES.ACCOUNT}>Minha Conta</Link>
    </li>
    {!!authUser.roles[ROLES.ADMIN] && (
      <li>
        <Link to={ROUTES.ADMIN}>Administrativo</Link>
      </li>
    )}
    <li>
      <SignOutButton />
    </li>
  </ul>
)

const NavigationNonAuth = () => (
  <ul className={'menu'}>
    <li>
      <Link to={ROUTES.SIGN_IN}>Entrar</Link>
    </li>
  </ul>
)

export default Navigation
