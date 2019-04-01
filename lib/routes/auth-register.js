const Joi = require('joi')

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
    const { userService, tokenService } = request.services(true)
    const { password, username, email } = request.payload

    try {
      const payload = await request.transaction(async tx => {
        const user = await userService.register(
          { username, email, password },
          tx
        )

        await tokenService.createRegisterToken({ user }, tx)

        return user
      })

      return payload
    } catch (error) {
      request.log(['error'], error)
      throw error
    }
  },
}
