const Joi = require('joi')

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
  handler: async (request, h) => {
    const { userService, tokenService } = request.services(true)
    const { tid, password } = request.payload

    try {
      await request.transaction(async tx => {
        const token = await tokenService.fetchResetToken({ id: tid }, tx)
        await userService.changePassword(token.userId, password, tx)
        await tokenService.destroyResetToken({ id: token.id }, tx)
      })

      return h.response().code(204)
    } catch (error) {
      request.log(['error'], error)
      throw error
    }
  },
}
