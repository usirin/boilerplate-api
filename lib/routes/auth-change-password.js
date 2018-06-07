const Joi = require('joi')
const Boom = require('boom')
const SecurePassword = require('secure-password')

const Password = new SecurePassword()

module.exports = {
  method: 'POST',
  path: '/auth/change-password',
  config: {
    tags: ['api'],
    validate: {
      payload: {
        tid: Joi.string().required(),
        password: Joi.binary().required(),
      },
    },
  },
  handler: async (server, h) => {
    const { tid, password } = server.payload
    const { Token, User } = server.models()

    const token = await Token.query().findById(tid)

    if (!token) {
      return Boom.unauthorized('wrong credentials')
    }

    const user = await User.query().findById(token.userId)

    if (!user) {
      return Boom.unauthorized('wrong credentials')
    }

    const hash = Password.hashSync(Buffer.from(password))

    await User.query()
      .patch({ password: hash.toString('utf8') })
      .where({ id: user.id })

    await Token.query().deleteById(tid)

    return h.response().code(204)
  },
}
