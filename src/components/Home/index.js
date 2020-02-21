import React from 'react'
import { compose } from 'recompose'
import { withFirebase } from '../Firebase'
import { withAuthorization } from '../Session'
import ProfissionaisPage from './profisionais'
import UnidadesPage from './unidades'
import * as ROLES from '../constants/roles'

const HomePage = () => (
  <div>
    <h1 style={{ textAlign: 'center', padding: 20 }}>Combos Cadastrados</h1>
    <Combos />
    <ProfissionaisPage />
    <UnidadesPage />
  </div>
)

class CombosBase extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      combos: [],
      profissionais: [],
      description: '',
      title: '',
      illustration: '',
      profissionalName: '',
      profissionalAvatar: ''
    }
  }

  componentDidMount() {
    this.setState({ loading: true })
    this.props.firebase.combos().on('value', snapshot => {
      const comboObject = snapshot.val()
      if (comboObject) {
        const comboList = Object.keys(comboObject).map(key => ({
          ...comboObject[key],
          uid: key
        }))
        this.setState({
          combos: comboList,
          loading: false
        })
      } else {
        this.setState({ combos: null, loading: false })
      }
    })
  }

  componentWillUnmount() {
    this.props.firebase.combos().off()
    this.props.firebase.profissionais().off()
  }

  handleChange = event => {
    const title = event.currentTarget.name
    const description = event.currentTarget.value
    this.setState({ [title]: description })
  }

  onCreateCombo = event => {
    if (
      this.state.title !== '' &&
      this.state.description !== '' &&
      this.state.illustration !== ''
    ) {
      this.props.firebase.combos().push({
        title: this.state.title,
        description: this.state.description,
        illustration: this.state.illustration
      })
      this.setState({ title: '', description: '', illustration: '' })
      event.preventDefault()
    } else {
      alert('Preencha todos os campos')
      event.preventDefault()
    }
  }

  onRemoveCombo = uid => {
    this.props.firebase.combo(uid).remove()
  }

  render() {
    const ComboList = ({ combos, onRemoveCombo }) => (
      <ul className={'combo-list'}>
        {combos.map(combo => (
          <ComboItem
            key={combo.uid}
            combo={combo}
            onRemoveCombo={onRemoveCombo}
            onEditCombo={this.onEditCombo}
          />
        ))}
      </ul>
    )

    class ComboItem extends React.Component {
      constructor(props) {
        super(props)
        this.state = {
          editMode: false,
          title: this.props.combo.title,
          description: this.props.combo.title
        }
      }

      onChangeEditText = event => {
        this.setState({ [event.currentTarget.name]: event.currentTarget.value })
      }

      onSaveEditText = () => {
        this.props.onEditCombo(
          this.props.combo,
          this.state.title,
          this.state.description
        )
        this.setState({ editMode: false })
      }

      render() {
        const { combo, onRemoveCombo } = this.props
        return (
          <li className={'combo-item'}>
            <div>
              <img
                className={'combo-item-img'}
                src={combo.illustration}
                alt={combo.name}
              />
              <div>
                <p className={'combo-item-title'}>
                  <span>Nome:</span> {combo.title}
                </p>
                <p className={'combo-item-desc'}>
                  <span>Descrição:</span> {combo.description}
                </p>
                <button
                  className={'btn btn-delete'}
                  type="button"
                  onClick={() => onRemoveCombo(combo.uid)}>
                  Apagar
                </button>
              </div>
            </div>
          </li>
        )
      }
    }

    const { title, description, illustration, combos, loading } = this.state

    return (
      <div className={'two-col'}>
        {loading && <div>Carregando combos ...</div>}
        {combos ? (
          <ComboList combos={combos} onRemoveCombo={this.onRemoveCombo} />
        ) : (
          <div>Nenhum combo cadastrado ...</div>
        )}
        <form className={'form-box'} onSubmit={this.onCreateCombo}>
          <h1>Adicionar novo</h1>
          <label>
            Nome
            <input
              name="title"
              type="text"
              value={title}
              onChange={this.handleChange}
            />
          </label>
          <label>
            Descrição
            <input
              name="description"
              type="text"
              value={description}
              onChange={this.handleChange}
            />
          </label>
          <label>
            Imagem
            <input
              name="illustration"
              type="text"
              value={illustration}
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

const Combos = withFirebase(CombosBase)

const condition = authUser => !!authUser && !!authUser.roles[ROLES.ADMIN]

export default compose(withAuthorization(condition))(HomePage)
