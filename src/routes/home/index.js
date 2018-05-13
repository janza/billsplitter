import { h, Component } from 'preact'
import style from './style'
import Bills from '../../lib/bill'

// import TextField from 'preact-material-components/TextField'
import FormField from 'preact-material-components/FormField'
import Chips from 'preact-material-components/Chips'
import Elevation from 'preact-material-components/Elevation'
import Select from 'preact-material-components/Select'
import Checkbox from 'preact-material-components/Checkbox'
import List from 'preact-material-components/List'
import Icon from 'preact-material-components/Icon'

const Button = props => (
  <button {...props} class={style.button}>
    {props.children}
  </button>
)

const TextField = props => <input {...props} class={style.input} />

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
    if (subGroup.length < 2 && !enabled) return
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
      chosenIndex: 0,
      subGroup: []
    })
  }

  render (props, state) {
    return (
      <div>
        <div class={style.newbill}>
          <div>
            <h3 style={'margin: 0 0 20px'}>Who paid?</h3>
            <div class={style.peoplelist}>
              {!state.chosenIndex ? (
                props.groups.map((group, idx) => (
                  <span
                    onClick={e => this.setGroup(idx + 1)}
                    class={style.person}
                    style={'cursor:pointer'}
                    key={group}
                  >
                    {group.toUpperCase()}
                  </span>
                ))
              ) : (
                <span class={style.person}>
                  {props.groups[state.chosenIndex - 1].toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {state.chosenIndex ? (
            <form
              style={'width: 100%; '}
              onSubmit={e => {
                e.preventDefault()
                this.setAmount(e.target.elements['amount'].value)
              }}
            >
              <div style={'width: 100%'}>
                <h3 style={'margin: 20px 0'}>How much?</h3>
                <div class={style.flex}>
                  <TextField
                    type="number"
                    name="amount"
                    fullwidth
                    step="any"
                    disabled={!!state.amount}
                    style={'margin-right: 20px'}
                    value={state.amount}
                    placeholder="Amount"
                  />
                  <Button style={state.amount ? 'opacity: 0' : ''}>Add</Button>
                </div>
              </div>
            </form>
          ) : null}
          <form
            onSubmit={e => {
              e.preventDefault()
              this.onAdd()
            }}
          >
            {state.chosenIndex && state.amount ? (
              <div>
                <div class={style.flex}>
                  <h3 style={'margin: 28px 0 20px'}>
                    Divided between:
                    {props.groups.map(g => {
                      const enabled = state.subGroup.includes(g)
                      return (
                        <span
                          class={[
                            // style.person,
                            style.persontoggle,
                            enabled ? '' : style.persondisabled
                          ].join(' ')}
                          onClick={_ => this.toggleSubGroup(g, !enabled)}
                        >
                          <span style={'text-transform: uppercase;'}>{g}</span>
                        </span>
                      )
                    })}
                  </h3>
                </div>
                <Button>Add</Button>
              </div>
            ) : null}
          </form>
        </div>
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
      <div class={style.billline}>
        <div class={style.billmain}>
          <div class={style.billamount}>€ {props.amount}</div>
          <span class={style.billperson}>{props.group.toUpperCase()}</span>
        </div>
        {props.subGroup.length !== props.totalList.length ? (
          <div class={style.billsplit}>
            <Icon style={'padding-right: 10px'}>group</Icon>
            {props.subGroup.join(', ')}
          </div>
        ) : null}
        <Button onClick={e => this.props.onRemove(props.group)}>Remove</Button>
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
      <div>
        <div class={style.newgroup}>
          {props.people.filter(notInGroups(props.groups)).map(p => {
            const enabled = state.people.includes(p)
            return (
              <span
                class={[
                  style.persontogglebtn,
                  enabled ? '' : style.persondisabledbtn
                ].join(' ')}
                onClick={_ => this.toggleSubGroup(p, !enabled)}
              >
                <span style={'text-transform: uppercase;'}>{p}</span>
              </span>
            )
          })}

          {props.people.filter(p => !notInGroups(props.groups)(p)).map(p => {
            return <span
              class={[
                style.persontogglebtn,
                style.persondisabledbtninactive
              ].join(' ')}
            >
              <span style={'text-transform: uppercase;'}>{p}</span>
            </span>
          })}
        </div>
        {state.people.length > 1 ? (
          <Button onClick={_ => this.createGroup()}>Create group</Button>
        ) : null}
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
    this.storeState({ newGroupName: name.toLowerCase() })
  }

  addGroup () {
    if (this.state.groups.includes(this.state.newGroupName)) {
      return this.storeState({
        newGroupName: ''
      })
    }
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
      bills: this.state.bills
        .map(bill => ({
          ...bill,
          subGroup: bill.subGroup.filter(p => p !== person)
        }))
        .filter(({ group, subGroup }) => group !== person && subGroup.length)
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
    var ownings = this.getOwnings()
    var groups = this.groups()
    return (
      <div>
        <div class={style.headertext}>
          <h1 class={style.title}>Go Dutch!</h1>
          <h5 class={style.subtitle}>And split those bills</h5>
        </div>
        <div class={style.home + ' ' + style.homewrapper}>
          <div class={style.block}>
            <h2>Who's in the group?</h2>
            <p>
              <form
                class={style.personform}
                onSubmit={e => {
                  e.preventDefault()
                  this.addGroup()
                }}
              >
                <TextField
                  placeholder="Person name"
                  style={'margin-right: 20px;'}
                  onChange={e => this.newGroupName(e.target.value)}
                  value={state.newGroupName}
                />
                <Button>Add person</Button>
              </form>

              <div class={style.peoplelist}>
                {state.groups.length
                  ? state.groups.map(name => {
                    return (
                      <span class={style.person}>
                        <Icon>person</Icon>
                        <span
                          style={
                            'text-transform: uppercase; padding-left: 6px;'
                          }
                        >
                          {name}
                        </span>
                        <a
                          href="#"
                          class={style.persondelete}
                          onClick={e => {
                            e.preventDefault()
                            this.removePerson(name)
                          }}
                        >
                            ×
                        </a>
                      </span>
                    )
                  })
                  : null}
              </div>
            </p>
            <div />
          </div>
          {this.state.groups.length > 1 ? (
            <div class={style.block}>
              <h2>Add some bills</h2>
              <div class={style.bills}>
                {state.bills.map(({ group, amount, subGroup }, i) => (
                  <Bill
                    key={i}
                    group={group}
                    amount={amount}
                    subGroup={subGroup}
                    totalList={state.groups}
                    onRemove={_ => this.removeBill(i)}
                  />
                ))}

                <NewBill
                  groups={state.groups}
                  onAdd={(group, amount, subGroup) =>
                    this.addBill(group, amount, subGroup)
                  }
                />
              </div>
            </div>
          ) : null}
          {state.groups.length > 1 && state.bills.length ? (
            <div class={style.block}>
              <h2>Group people <small>(optional)</small></h2>
              <NewGroup
                onNewGroup={newGroup => this.groupPeople(newGroup)}
                people={state.groups}
                groups={state.peopleGroups}
              />

              <div class={style.grouplist}>
                {groups.length !== state.groups.length
                  ? groups.map((g, i) => (
                    <div class={style.listitem}>
                      <span>{g.join(' & ').toUpperCase()}</span>
                      {g.length > 1 ? (
                        <a
                          href="#"
                          style="color: #11515b"
                          onClick={e => {
                            e.preventDefault()
                            this.removeGroup(i)
                          }}
                        >
                          <Icon>delete</Icon>
                        </a>
                      ) : null}
                    </div>
                  ))
                  : null}
              </div>
            </div>
          ) : null}
        </div>

        {this.state.groups.length > 1 ? (
          <div class={style.homewrapper + ' ' + style.blockinvert}>
            <h2 style="color: #fff">Who owns what?</h2>
            <div class={style.ownings}>
              {Object.keys(ownings).reduce((list, owner) => {
                const source = owner.split('+').join(' & ')
                return list.concat(
                  Object.keys(ownings[owner]).map(ownee => {
                    var amount = ownings[owner][ownee]
                    const target = ownee.split('+').join(' & ')
                    return (
                      <div class={style.owning}>
                        <div class={style.owningdetail}>
                          <strong>{source.toUpperCase()}</strong>
                          <div class={style.owningarrowwrap}>
                            <Icon class={style.owningarrow}>arrow_forward</Icon>
                          </div>
                          <strong>{target.toUpperCase()}</strong>
                        </div>

                        <div class={style.owningamount}>
                          <strong>€ {amount.toFixed(2)}</strong>
                        </div>
                      </div>
                    )
                  })
                )
              }, [])}
            </div>
          </div>
        ) : null}
      </div>
    )
  }
}
