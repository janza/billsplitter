class Group {
  constructor (groups) {
    this._people = {}
    var people = groups.map(group => group.join('+'))
    this._groups = groups
    this._peopleCount = groups.reduce((count, group) => count + group.length, 0)
    people.forEach(person => {
      people.forEach(otherPerson => {
        if (!this._people[person]) {
          this._people[person] = {}
        }
        this._people[person][otherPerson] = 0
      })
    })
    this._peopleNames = Object.keys(this._people)
  }

  findPerson (person) {
    return this._groups.filter(group => group.includes(person)).map(group => group.join('+'))[0]
  }

  groupCount (group) {
    return group.split('+').length
  }

  iterate (ignoreName, cb) {
    this._peopleNames.forEach(person => {
      if (person === ignoreName) {
        return
      }
      cb(person)
    })
  }

  forEachWhoOwns (name, cb) {
    this.iterate(name, person => {
      if (this._people[person][name]) cb(person)
    })
  }

  personPaid (name, amount, splitBetween) {
    name = this.findPerson(name)
    var splitAmount = amount / this._peopleCount
    if (splitBetween) {
      splitAmount = amount / splitBetween.length
    }
    this.iterate(name, person => {
      if (!splitBetween || splitBetween.map(p => this.findPerson(p)).includes(person)) {
        this._people[person][name] += splitAmount * this.groupCount(person)
      }
    })
    this.iterate(name, person => {
      if (this._people[name][person] === 0) return
      var diff = this._people[person][name] - this._people[name][person]
      if (diff >= 0) {
        this._people[person][name] = diff
        this._people[name][person] = 0
      } else {
        this._people[name][person] = -diff
        this._people[person][name] = 0
      }
    })
    this.iterate('', name => {
      this.forEachWhoOwns(name, person => {
        this.forEachWhoOwns(person, otherPerson => {
          if (otherPerson === name) return
          var personOwns = this._people[person][name]
          var otherPersonOwns = this._people[otherPerson][person]
          var diff = Math.min(personOwns, otherPersonOwns)
          this._people[person][name] -= diff
          this._people[otherPerson][person] -= diff
          this._people[otherPerson][name] += diff
        })
      })
    })
  }

  ownings () {
    var totalOwnings = {}
    Object.keys(this._people).forEach(group => {
      var ownings = this._people[group]
      Object.keys(ownings).filter(o => ownings[o]).forEach(receiver => {
        if (!totalOwnings[group]) totalOwnings[group] = {}
        totalOwnings[group][receiver] = ownings[receiver]
      })
    })
    return totalOwnings
  }

  prettyPrint () {
    return Object.keys(this._people).map(group => {
      var ownings = this._people[group]
      return Object.keys(ownings).filter(o => ownings[o]).map(receiver => {
        return `${group} => ${receiver} ${ownings[receiver]}`
      }).join('\n')
    }).filter(s => s).join('\n')
  }
}

module.exports = Group
