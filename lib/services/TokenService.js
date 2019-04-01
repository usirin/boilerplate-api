const { Service } = require('schmervice')

const TokenType = {
  Auth: 'auth',
  ResetPassword: 'reset-password',
  Register: 'register',
}

module.exports = class TokenService extends Service {
  async createAuthToken({ user }, transaction) {
    const { Token } = this.server.models(true)

    return await Token.query(transaction).insertAndFetch({
      userId: user.id,
      type: TokenType.Auth,
    })
  }

  async createRegisterToken({ user }, transaction) {
    const { Token } = this.server.models(true)

    return await Token.query(transaction).insertAndFetch({
      userId: user.id,
      type: TokenType.Register,
    })
  }

  async fetchResetToken({ id }, transaction) {
    const { Token } = this.server.models(true)

    return await Token.query(transaction)
      .throwIfNotFound()
      .where({ id, type: TokenType.ResetPassword })
      .first()
  }

  async destroyResetToken({ id }, transaction) {
    const { Token } = this.server.models(true)

    return await Token.query(transaction).deleteById(id)
  }
}
