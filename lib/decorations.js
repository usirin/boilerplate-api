const Objection = require('objection')

const transaction = server => fn => Objection.transaction(server.knex(), fn)

module.exports = server => [
  {
    type: 'server',
    property: 'transaction',
    method: transaction(server),
  },
  {
    type: 'request',
    property: 'transaction',
    method: transaction(server),
  },
]
