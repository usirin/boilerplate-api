/* eslint-disable no-console */
const Joi = require('joi')
const Boom = require('boom')
const SecurePassword = require('secure-password')
const { wrapError, UniqueViolationError } = require('db-errors')

const Password = new SecurePassword()

module.exports = {
  method: 'POST',
  path: '/auth/register',
  config: {
    description: 'Register new user',
    tags: ['api'],
    validate: {
      payload: {
        username: Joi.string()
          .alphanum()
          .min(2)
          .required(),
        email: Joi.string()
          .email()
          .required(),
        password: Joi.binary().required(),
      },
    },
    auth: false,
  },
  handler: async request => {
    const { User, Token } = request.models()

    const { password, username, email } = request.payload

    const pwd = Buffer.from(password)
    const hash = Password.hashSync(pwd)

    try {
      const user = await User.query().insertAndFetch({
        email,
        username,
        password: hash.toString('utf8'),
      })

      await Token.query().insertAndFetch({
        userId: user.id,
        type: 'register',
      })

      return user
    } catch (error) {
      const wrapped = wrapError(error)

      if (wrapped instanceof UniqueViolationError) {
        return Boom.badRequest(`Duplicate payload entry: ${wrapped.columns[0]}`)
      }

      return error
    }
  },
}
