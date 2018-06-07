const uuid = require('uuid/v4')

exports.seed = function(knex) {
  return knex('users').then(() => {
    return Promise.all([
      knex('users').insert({ id: uuid(), email: 'a@b.c', username: 'abc' }),
      knex('users').insert({ id: uuid(), email: 'd@e.f', username: 'def' }),
    ]).then(([user1, user2]) => {
      return Promise.all([
        knex('tokens').insert({
          id: uuid(),
          userId: user1.id,
          type: 'register',
        }),
        knex('tokens').insert({
          id: uuid(),
          userId: user2.id,
          type: 'reset-password',
        }),
      ])
    })
  })
}
