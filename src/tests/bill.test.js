var jest = require('jest')
var Bill = require('../lib/bill')

describe('Bill', () => {

  test('Simple', () => {
    var people = new Bill([['lorena'], ['josip']])
    people.personPaid('lorena', 10)

    expect({
      'josip': {
        'lorena': 5
      },
    }).toEqual(people.ownings())
  })

  test('Calculates correctly with all features', () => {

    var people = new Bill([['lorena', 'josip'], ['artur', 'natalia'], ['ieva']])

    people.personPaid('artur', 50)
    people.personPaid('josip', 10)
    people.personPaid('josip', 22, ['josip', 'lorena', 'artur', 'natalia'])

    expect({
      'lorena+josip': {
        'artur+natalia': 3
      },
      'ieva': {
        'artur+natalia': 12
      }
    }).toEqual(people.ownings())
  })
})
