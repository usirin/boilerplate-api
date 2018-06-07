const Boom = require('boom')
const { Service } = require('schmervice')
const SecurePassword = require('secure-password')
const Jwt = require('jsonwebtoken')

module.exports = class UserService extends Service {
  constructor(...args) {
    super(...args)

    const pwd = new SecurePassword()

    this.pwd = {
      hash: pwd.hashSync.bind(pwd),
      verify: pwd.verifySync.bind(pwd),
    }
  }

  async login({ username, email, password }, transaction) {
    const { User } = this.server.models(true)
    const query = username ? { username } : { email }

    const user = await User.query(transaction)
      .throwIfNotFound()
      .where(query)
      .first()

    const passwordCheck = await this.pwd.verify(
      Buffer.from(password),
      user.password
    )

    if (
      passwordCheck === SecurePassword.INVALID ||
      passwordCheck === SecurePassword.INVALID_UNRECOGNIZED_HASH
    ) {
      throw Boom.unauthorized('wrong credentials')
    }

    if (
      passwordCheck !== SecurePassword.VALID &&
      passwordCheck !== SecurePassword.VALID_NEEDS_REHASH
    ) {
      throw User.createNotFoundError()
    }

    if (passwordCheck === SecurePassword.VALID_NEEDS_REHASH) {
      await this.changePassword(user.id, password, transaction)
    }

    return user
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
        password: await this.pwd.hash(Buffer.from(password)),
      })

    return true
  }
}
