const Boom = require('boom')
const Bcrypt = require('bcrypt')
const { Service } = require('schmervice')
const Jwt = require('jsonwebtoken')
const { wrapError, UniqueViolationError } = require('db-errors')

const SALT_ROUNDS = 10

const sanitize = p => (p instanceof Buffer ? p.toString('utf8') : p)

module.exports = class UserService extends Service {
  async login({ username, email, password }, transaction) {
    const { User } = this.server.models(true)
    const query = username ? { username } : { email }

    const user = await User.query(transaction)
      .where(query)
      .first()

    if (!user) {
      throw Boom.unauthorized('wrong credentials')
    }

    const passwordCheck = await Bcrypt.compare(
      sanitize(password),
      sanitize(user.password)
    )

    if (!passwordCheck) {
      throw Boom.unauthorized('wrong credentials')
    }

    return user
  }

  async register({ username, email, password }, transaction) {
    const { User } = this.server.models(true)

    try {
      password = await Bcrypt.hash(sanitize(password), SALT_ROUNDS)

      const user = await User.query(transaction).insertAndFetch({
        email,
        username,
        password,
      })

      return user
    } catch (err) {
      const error = wrapError(err)

      if (error instanceof UniqueViolationError) {
        throw Boom.badRequest(`Duplicate payload entry: ${error.columns[0]}`)
      }

      throw err
    }
  }

  async createToken(id) {
    return await Jwt.sign({ id }, this.options.jwtKey)
  }

  async changePassword(id, password, transaction) {
    const { User } = this.server.models(true)

    await User.query(transaction)
      .throwIfNotFound()
      .where({ id })
      .patch({
        password: await Bcrypt.hash(sanitize(password), SALT_ROUNDS),
      })

    return true
  }
}
