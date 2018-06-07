exports.up = knex => {
  return knex.schema
    .createTable('users', t => {
      t.uuid('id').primary()
      t.string('username')
        .notNullable()
        .unique()
      t.string('email')
        .notNullable()
        .unique()
      t.binary('password')
      t.string('scope').nullable()
      t.boolean('isAdmin').defaultTo(false)
      t.boolean('isActive').defaultTo(false)
      t.boolean('isBanned').defaultTo(false)
      t.timestamp('createdAt')
      t.timestamp('updatedAt')
      t.timestamp('deletedAt')
    })
    .createTable('tokens', t => {
      t.uuid('id').primary()
      t.uuid('userId')
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      t.string('type').notNullable()
      t.timestamp('createdAt')
      t.timestamp('updatedAt')
      t.timestamp('deletedAt')
    })
}

exports.down = knex => {
  return knex.schema.dropTable('tokens').dropTable('users')
}
