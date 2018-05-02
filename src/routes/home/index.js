import { h, Component } from 'preact'
import style from './style'
import Bills from '../../lib/bill'

import Button from 'preact-material-components/Button'
import TextField from 'preact-material-components/TextField'
import FormField from 'preact-material-components/FormField'
import Chips from 'preact-material-components/Chips'
import Elevation from 'preact-material-components/Elevation'
import Select from 'preact-material-components/Select'
import Checkbox from 'preact-material-components/Checkbox'
import List from 'preact-material-components/List'
import Icon from 'preact-material-components/Icon'

import 'preact-material-components/List/style.css'
// import 'preact-material-components/Button/style.css'
// import 'preact-material-components/TextField/style.css'
// import 'preact-material-components/Elevation/style.css'
// import 'preact-material-components/Select/style.css'
// import 'preact-material-components/List/style.css'
// import 'preact-material-components/Menu/style.css'
import 'preact-material-components/style.css'
// import 'preact-material-components/Theme/mdc-theme.scss'

class NewBill extends Component {
  constructor (props) {
    super()
    this.includeGroup = {}

    this.state = {
      amount: '',
      subGroup: props.groups,
      chosenIndex: 0
    }
  }

  componentWillReceiveProps (props) {
    this.setState({
      subGroup: props.groups
    })
  }

  setAmount (amount) {
    this.setState({ amount })
  }

  setGroup (chosenIndex) {
    this.setState({ chosenIndex })
  }

  toggleSubGroup (group, enabled) {
    var subGroup = this.state.subGroup
    var included = subGroup.includes(group)
    if (enabled && !included) {
      subGroup = subGroup.concat([group])
    }
    if (!enabled && included) {
      subGroup = subGroup.concat([])
      subGroup.splice(subGroup.indexOf(group), 1)
    }

    this.setState({ subGroup: subGroup })
  }

  onAdd () {
    var group = this.props.groups[this.state.chosenIndex - 1]
    if (!group) return
    var subGroup = this.state.subGroup
    var amount = parseFloat(this.state.amount)
    if (isNaN(amount) || amount === 0) {
      return
    }
    this.props.onAdd(group, amount, subGroup)
    this.setState({
      amount: '',
      subGroup: []
    })
  }

  render (props, state) {
    return (
      <div class={style.newbill}>
        <Elevation z={1}>
          <div class={style.billInner}>
            <Select
              hintText="Person that paid"
              class={style.input}
              selectedIndex={state.chosenIndex}
              onChange={e => this.setGroup(e.target.selectedIndex)}
            >
              {props.groups.map(group => (
                <Select.Item key={group}>{group}</Select.Item>
              ))}
            </Select>
            <TextField
              label="Amount"
              type="number"
              class={style.input}
              step="any"
              onChange={e => this.setAmount(e.target.value)}
              value={state.amount}
            />
            <div>
              {props.groups.map(g => {
                return (
                  <FormField key={g}>
                    <Checkbox
                      id={`basic-checkbox-${g}`}
                      onChange={e => this.toggleSubGroup(g, e.target.checked)}
                      checked={state.subGroup.includes(g)}
                    />
                    <label for={`basic-checkbox-${g}`}>{g}</label>
                  </FormField>
                )
              })}
            </div>
            <Button onClick={e => this.onAdd()}>Add</Button>
          </div>
        </Elevation>
      </div>
    )
  }
}

const Normal = props => (
  <span style={'font-weight: normal'}>{props.children}</span>
)

class Bill extends Component {
  render (props) {
    return (
      <div class={style.bill}>
        <Elevation z={1}>
          <div class={style.billInner}>
            <h3 style={'margin: 5px 0 10px'}>
              {props.group} <Normal>paid</Normal> {props.amount}
            </h3>
            <div>
              Split between: <br /> <i>{props.subGroup.join(' ')}</i>
            </div>
            <Button onClick={e => this.props.onRemove(props.group)}>
              Remove
            </Button>
          </div>
        </Elevation>
      </div>
    )
  }
}

function notInGroups (g) {
  return p => !g.some(g => g.includes(p))
}

class NewGroup extends Component {
  constructor (props) {
    super()
    this.state = {
      people: []
      // groups: props.groups
    }
  }

  toggleSubGroup (group, enabled) {
    var people = this.state.people
    var included = people.includes(group)
    if (enabled && !included) {
      people = people.concat([group])
    }
    if (!enabled && included) {
      people = people.concat([])
      people.splice(people.indexOf(group), 1)
    }

    this.setState({ people: people })
  }

  createGroup () {
    this.props.onNewGroup(this.state.people)
    this.setState({ people: [] })
  }

  render (props, state) {
    return (
      <div class={style.newgroup}>
        <Elevation z={1}>
          {props.people.filter(notInGroups(props.groups)).map(p => {
            return (
              <FormField key={p}>
                <Checkbox
                  id={`basic-checkbox-group-${p}`}
                  onChange={e => this.toggleSubGroup(p, e.target.checked)}
                  checked={state.people.includes(p)}
                />
                <label for={`basic-checkbox-group-${p}`}>{p}</label>
              </FormField>
            )
          })}
          <Button onClick={_ => this.createGroup()}>Create</Button>
        </Elevation>
      </div>
    )
  }
}

export default class Home extends Component {
  constructor () {
    super()
    var initialState = {
      newGroupName: '',
      groups: [],
      bills: [],
      peopleGroups: []
    }
    try {
      var savedState = JSON.parse(window.localStorage.getItem('state'))
    } catch (err) {}

    if (savedState) {
      Object.assign(initialState, savedState)
    }
    this.state = initialState
  }

  storeState (state) {
    var stateToStore = Object.assign({}, this.state, state)
    window.localStorage.setItem('state', JSON.stringify(stateToStore))
    this.setState(state)
  }

  newGroupName (name) {
    this.storeState({ newGroupName: name })
  }

  addGroup () {
    this.storeState({
      groups: this.state.groups.concat(this.state.newGroupName),
      newGroupName: ''
    })
  }

  addBill (group, amount, subGroup) {
    this.storeState({
      bills: this.state.bills.concat({ group, amount, subGroup })
    })
  }

  removeBill (index) {
    var bills = this.state.bills.concat([])
    bills.splice(index, 1)
    this.storeState({ bills })
  }

  removeGroup (index) {
    var peopleGroups = this.state.peopleGroups.concat([])
    peopleGroups.splice(index, 1)
    this.storeState({ peopleGroups })
  }

  removePerson (person) {
    var groups = this.state.groups.concat([])
    groups.splice(groups.indexOf(person), 1)

    var peopleGroups = this.state.peopleGroups
      .map(g => g.filter(p => p !== person))
      .filter(g => g.length > 1)

    this.storeState({
      groups,
      peopleGroups,
      bills: this.state.bills.map(bill => ({
        ...bill,
        subGroup: bill.subGroup.filter(p => p !== person)
      })).filter(({ group, subGroup }) => group !== person && subGroup.length)
    })
  }

  getOwnings () {
    var bills = new Bills(this.groups())
    this.state.bills.forEach(({ group, amount, subGroup }) => {
      bills.personPaid(group.split('+')[0], amount, subGroup)
    })
    return bills.ownings()
  }

  groups () {
    var peopleGroups = this.state.peopleGroups
    var people = this.state.groups
    return peopleGroups.concat(
      people.filter(notInGroups(peopleGroups)).map(p => [p])
    )
  }

  groupPeople (group) {
    this.storeState({
      peopleGroups: this.state.peopleGroups.concat([group])
    })
  }

  render (props, state) {
    console.log(state)
    var ownings = this.getOwnings()
    var groups = this.groups()
    return (
      <div class={style.home}>
        <h1>Bill splitter</h1>
        <div class={style.block}>
          <h2>1. Add people</h2>
          <p>
            <TextField
              label="Name"
              focus
              class={style.input}
              onChange={e => this.newGroupName(e.target.value)}
              value={state.newGroupName}
            />
            <Button onClick={_ => this.addGroup()}>Add person</Button>

            {state.groups.length ? (
              <List class={style.list}>
                {state.groups.map(name => {
                  return (
                    <List.Item key={name} class={style.listitem}>
                      <span>{name}</span>
                      <a href="#" style="" onClick={_ => this.removePerson(name)}>
                        <Icon>delete</Icon>
                      </a>
                    </List.Item>
                  )
                })}
              </List>
            ) : null}
          </p>
          <div />
        </div>
        <div class={style.block}>
          <h2>2. Add bills</h2>
          <div class={style.bills}>
            <NewBill
              groups={state.groups}
              onAdd={(group, amount, subGroup) => this.addBill(group, amount, subGroup)
              }
            />
            {state.bills.map(({ group, amount, subGroup }, i) => (
              <Bill
                key={i}
                group={group}
                amount={amount}
                subGroup={subGroup}
                onRemove={_ => this.removeBill(i)}
              />
            ))}
          </div>
        </div>
        <div class={style.block}>
          <h2>3. Group people</h2>
          <NewGroup
            onNewGroup={newGroup => this.groupPeople(newGroup)}
            people={state.groups}
            groups={state.peopleGroups}
          />
          {groups.length ? (
            <List class={style.list}>
              {groups.map((g, i) => (
                <List.Item class={style.listitem}>
                  <span>{g.join(' & ')}</span>
                  {g.length > 1 ? (
                    <a href="#" style="" onClick={_ => this.removeGroup(i)}>
                      <Icon>delete</Icon>
                    </a>
                  ) : null}
                </List.Item>
              ))}
            </List>
          ) : null}
        </div>

        <div class={style.block}>
          <h2>4. Who owns what?</h2>
          <List class={style.list} style={'width: 100%; max-width: none'}>
            {Object.keys(ownings).map(owner => {
              const source = owner.split('+').join(' & ')
              return <List.Item key={`${owner}`} >
                <strong style='padding-right: 10px'>{source.toUpperCase() + ': '}</strong>
                {Object.keys(ownings[owner]).map(ownee => {
                  var amount = ownings[owner][ownee]
                  const target = ownee.split('+').join(' & ')
                  return <span>{target} <strong>{amount}</strong></span>
                })}
              </List.Item>
            })}
          </List>
        </div>
      </div>
    )
  }
}

// <List.TextContainer>
//   <List.PrimaryText>{source}</List.PrimaryText>
//   <List.SecondaryText>
//     {Object.keys(ownings[owner]).map(ownee => {
//       var amount = ownings[owner][ownee]
//       const target = ownee.split('+').join(' & ')
//       return <span>{target} <strong>{amount}</strong> {'   '}</span>
//     })}
//   </List.SecondaryText>
// </List.TextContainer>
