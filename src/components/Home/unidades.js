import React from 'react'
import { compose } from 'recompose'
import { withFirebase } from '../Firebase'
import { withAuthorization } from '../Session'
import * as ROLES from '../constants/roles'

const UnidadesPage = () => (
  <div>
    <h1 style={{ textAlign: 'center', padding: 40 }}>Unidades Cadastradas</h1>
    <Unidades />
  </div>
)

class UnidadesBase extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      unidades: [],
      unidadeName: '',
      unidadeAvatar: ''
    }
  }

  componentDidMount() {
    this.setState({ loading: true })
    this.props.firebase.unidades().on('value', snapshot => {
      const unidadeObject = snapshot.val()
      if (unidadeObject) {
        const unidadeList = Object.keys(unidadeObject).map(key => ({
          ...unidadeObject[key],
          uid: key
        }))
        this.setState({
          unidades: unidadeList,
          loading: false
        })
      } else {
        this.setState({ unidades: null, loading: false })
      }
    })
  }

  componentWillUnmount() {
    this.props.firebase.unidades().off()
  }

  handleChange = event => {
    const title = event.currentTarget.name
    const description = event.currentTarget.value
    this.setState({ [title]: description })
  }

  onCreateUnidade = event => {
    if (this.state.unidadeAvatar !== '' && this.state.unidadeName !== '') {
      this.props.firebase.unidades().push({
        unidadeName: this.state.unidadeName,
        unidadeAvatar: this.state.unidadeAvatar
      })
      this.setState({ unidadeName: '', unidadeAvatar: '' })
      event.preventDefault()
    } else {
      alert('Preencha todos os campos')
      event.preventDefault()
    }
  }

  onRemoveUnidade = uid => {
    this.props.firebase.unidade(uid).remove()
  }

  render() {
    const UnidadeList = ({ unidades, onRemoveUnidade }) => (
      <ul className={'combo-list'}>
        {unidades.map(unidade => (
          <UnidadeItem
            key={unidade.uid}
            unidade={unidade}
            onRemoveUnidade={onRemoveUnidade}
            onEditUnidade={this.onEditUnidade}
          />
        ))}
      </ul>
    )

    class UnidadeItem extends React.Component {
      constructor(props) {
        super(props)
        this.state = {
          editMode: false,
          unidadelName: this.props.unidade.unidadeName,
          unidadeAvatar: this.props.unidade.unidadeAvatar
        }
      }

      onChangeEditText = event => {
        this.setState({
          [event.currentTarget.unidadeName]: event.currentTarget.value
        })
      }

      onSaveEditText = () => {
        this.props.onEditCombo(
          this.props.unidade,
          this.state.unidadeName,
          this.state.unidadeAvatar
        )
        this.setState({ editMode: false })
      }

      render() {
        const { unidade, onRemoveUnidade } = this.props
        return (
          <li className={'combo-item'}>
            <div>
              <div style={{ flexDirection: 'column' }}>
                <p className={'combo-item-title'}>
                  <span>Nome:</span> {unidade.unidadeName}
                </p>
                <p className={'combo-item-desc'}>
                  <span>Endereço:</span> {unidade.unidadeAvatar}
                </p>
                <button
                  className={'btn btn-delete'}
                  type="button"
                  onClick={() => onRemoveUnidade(unidade.uid)}>
                  Apagar
                </button>
              </div>
            </div>
          </li>
        )
      }
    }

    const { unidadeAvatar, unidadeName, unidades, loading } = this.state

    return (
      <div className={'two-col'}>
        {loading && <div>Carregando unidades ...</div>}
        {unidades ? (
          <UnidadeList
            unidades={unidades}
            onRemoveUnidade={this.onRemoveUnidade}
          />
        ) : (
          <div>Nenhuma unidade cadastrada ...</div>
        )}
        <form className={'form-box'} onSubmit={this.onCreateUnidade}>
          <h1>Adicionar novo</h1>
          <label>
            Nome
            <input
              name="unidadeName"
              type="text"
              value={unidadeName}
              onChange={this.handleChange}
            />
          </label>
          <label>
            Endereço
            <input
              name="unidadeAvatar"
              type="text"
              value={unidadeAvatar}
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

const Unidades = withFirebase(UnidadesBase)

const condition = authUser => !!authUser && !!authUser.roles[ROLES.ADMIN]

export default compose(withAuthorization(condition))(UnidadesPage)
