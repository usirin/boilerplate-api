const Joi = require('joi')
const Boom = require('boom')
const SecurePassword = require('secure-password')
const Jwt = require('jsonwebtoken')

const Password = new SecurePassword()

module.exports = (server, options) => ({
  method: 'POST',
  path: '/auth/login',
  config: {
    description: 'Log in',
    tags: ['api'],
    validate: {
      payload: Joi.object()
        .keys({
          username: Joi.string(),
          email: Joi.string().email(),
          password: Joi.string()
            .min(6)
            .max(200)
            .required(),
        })
        .xor('username', 'email'),
    },
    response: {
      schema: Joi.object({
        token: Joi.string(),
      }).label('Result'),
    },
    auth: false,
  },
  handler: async request => {
    const { Token, User } = request.models()
    const { username, password, email } = request.payload

    const query = username ? { username } : { email }

    const user = await User.query()
      .where(query)
      .first()

    if (!user) {
      return Boom.unauthorized('wrong credentials')
    }

    const pwd = Buffer.from(password)
    const hash = Buffer.from(user.password)

    const result = await Password.verifySync(pwd, hash)

    if (
      result === SecurePassword.INVALID ||
      result === SecurePassword.INVALID_UNRECOGNIZED_HASH
    ) {
      return Boom.unauthorized('wrong credentials')
    }

    if (
      result !== SecurePassword.VALID &&
      result !== SecurePassword.VALID_NEEDS_REHASH
    ) {
      return Boom.unauthorized('wrong credentials')
    }

    if (result === SecurePassword.VALID_NEEDS_REHASH) {
      const newHash = await Password.hashSync(pwd)
      await User.query()
        .where({ id: user.id })
        .patch({
          password: newHash.toString('utf8'),
        })
    }

    const token = await Token.query().insertAndFetch({
      userId: user.id,
      type: 'auth',
    })

    await token.$relatedQuery('user').relate(user)

    return {
      token: Jwt.sign(
        {
          id: token.id,
        },
        options.jwtKey
      ),
    }
  },
})
