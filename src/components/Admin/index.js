import React, { Component } from 'react'
import { compose } from 'recompose'
import { withFirebase } from '../Firebase'
import { withAuthorization } from '../Session'
import { SignUpLink } from '../SignUp'
import * as ROLES from '../constants/roles'

class AdminPage extends Component {
  constructor(props) {
    super(props)

    this.state = {
      loading: false,
      users: []
    }
  }

  componentDidMount() {
    this.setState({ loading: true })

    this.props.firebase.users().on('value', snapshot => {
      const usersObject = snapshot.val()

      const usersList = Object.keys(usersObject).map(key => ({
        ...usersObject[key],
        uid: key
      }))

      this.setState({
        users: usersList,
        loading: false
      })
    })
  }

  componentWillUnmount() {
    this.props.firebase.users().off()
  }
  render() {
    const { users, loading } = this.state

    return (
      <div>
        <h1>Usuários cadastrados -> {users.length}</h1>
        <SignUpLink />

        {loading && <div>Loading ...</div>}
        <UserList users={users} />
      </div>
    )
  }
}

const UserList = ({ users }) => (
  <ul style={{ margin: '0', padding: '0' }}>
    {users.map(user => (
      <li key={user.uid}>
        <span>
          <strong>Nome:</strong> {user.name}
        </span>
        {' | '}
        <span>
          <strong>E-Mail:</strong> {user.email}
        </span>
        <hr />
      </li>
    ))}
  </ul>
)

const condition = authUser => !!authUser && !!authUser.roles[ROLES.ADMIN]

export default compose(
  withAuthorization(condition),
  withFirebase
)(AdminPage)
