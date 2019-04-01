const Joi = require('joi')

module.exports = {
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
    const { userService, tokenService } = request.services(true)
    const { username, password, email } = request.payload

    try {
      const payload = await request.transaction(async tx => {
        const user = await userService.login({ username, email, password }, tx)
        const token = await tokenService.createAuthToken({ user }, tx)

        return {
          token: await userService.createToken(token.id),
        }
      })

      return payload
    } catch (error) {
      request.log(['error'], error)
      throw error
    }
  },
}
