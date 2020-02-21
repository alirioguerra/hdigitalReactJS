import React from 'react'
import { compose } from 'recompose'
import { withFirebase } from '../Firebase'
import { withAuthorization } from '../Session'
import * as ROLES from '../constants/roles'

const ProfissionaisPage = () => (
  <div>
    <h1 style={{ textAlign: 'center', padding: 40 }}>
      profissionais Cadastrados
    </h1>
    <Profissionais />
  </div>
)

class ProfisionaisBase extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      profissionais: [],
      profissionalName: '',
      profissionalAvatar: ''
    }
  }

  componentDidMount() {
    this.setState({ loading: true })
    this.props.firebase.profissionais().on('value', snapshot => {
      const profissionalObject = snapshot.val()
      if (profissionalObject) {
        const profissionalList = Object.keys(profissionalObject).map(key => ({
          ...profissionalObject[key],
          uid: key
        }))
        this.setState({
          profissionais: profissionalList,
          loading: false
        })
      } else {
        this.setState({ profissionais: null, loading: false })
      }
    })
  }

  componentWillUnmount() {
    this.props.firebase.profissionais().off()
  }

  handleChange = event => {
    const title = event.currentTarget.name
    const description = event.currentTarget.value
    this.setState({ [title]: description })
  }

  onCreateProfissional = event => {
    if (
      this.state.profissionalAvatar !== '' &&
      this.state.profissionalName !== ''
    ) {
      this.props.firebase.profissionais().push({
        profissionalName: this.state.profissionalName,
        profissionalAvatar: this.state.profissionalAvatar
      })
      this.setState({ profissionalName: '', profissionalAvatar: '' })
      event.preventDefault()
    } else {
      alert('Preencha todos os campos')
      event.preventDefault()
    }
  }

  onRemoveProfissional = uid => {
    this.props.firebase.profissional(uid).remove()
  }

  render() {
    const ProfissionalList = ({ profissionais, onRemoveProfissional }) => (
      <ul className={'combo-list'}>
        {profissionais.map(profissional => (
          <ProfissionalItem
            key={profissional.uid}
            profissional={profissional}
            onRemoveProfissional={onRemoveProfissional}
            onEditCombo={this.onEditCombo}
          />
        ))}
      </ul>
    )

    class ProfissionalItem extends React.Component {
      constructor(props) {
        super(props)
        this.state = {
          editMode: false,
          profissionalName: this.props.profissional.profissionalName,
          profissionalAvatar: this.props.profissional.profissionalAvatar
        }
      }

      onChangeEditText = event => {
        this.setState({
          [event.currentTarget.profissionalName]: event.currentTarget.value
        })
      }

      onSaveEditText = () => {
        this.props.onEditCombo(
          this.props.profissional,
          this.state.profissionalName,
          this.state.profissionalAvatar
        )
        this.setState({ editMode: false })
      }

      render() {
        const { profissional, onRemoveProfissional } = this.props
        return (
          <li className={'combo-item'}>
            <div>
              <img
                className={'combo-item-img'}
                src={profissional.profissionalAvatar}
                alt={profissional.profissionalName}
              />
              <div>
                <p className={'combo-item-title'}>
                  <span>Nome:</span> {profissional.profissionalName}
                </p>
                <p className={'combo-item-desc'}>
                  <span>Foto:</span> {profissional.profissionalAvatar}
                </p>
                <button
                  className={'btn btn-delete'}
                  type="button"
                  onClick={() => onRemoveProfissional(profissional.uid)}>
                  Apagar
                </button>
              </div>
            </div>
          </li>
        )
      }
    }

    const {
      profissionalAvatar,
      profissionalName,
      profissionais,
      loading
    } = this.state

    return (
      <div className={'two-col'}>
        {loading && <div>Carregando profissionais ...</div>}
        {profissionais ? (
          <ProfissionalList
            profissionais={profissionais}
            onRemoveProfissional={this.onRemoveProfissional}
          />
        ) : (
          <div>Nenhum profissional cadastrado ...</div>
        )}
        <form className={'form-box'} onSubmit={this.onCreateProfissional}>
          <h1>Adicionar novo</h1>
          <label>
            Nome
            <input
              name="profissionalName"
              type="text"
              value={profissionalName}
              onChange={this.handleChange}
            />
          </label>
          <label>
            Foto
            <input
              name="profissionalAvatar"
              type="text"
              value={profissionalAvatar}
              onChange={this.handleChange}
            />
          </label>
          <button className={'btn btn-add'} type="submit">
            Adicionar
          </button>
        </form>
      </div>
    )
  }
}

const Profissionais = withFirebase(ProfisionaisBase)

const condition = authUser => !!authUser && !!authUser.roles[ROLES.ADMIN]

export default compose(withAuthorization(condition))(ProfissionaisPage)
