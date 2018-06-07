const Joi = require('joi')

module.exports = {
  method: 'POST',
  path: '/auth/logout-all',
  config: {
    description: 'Log user out of all current sessions',
    tags: ['api', 'private'],
    validate: {
      headers: Joi.object({
        authorization: Joi.string().description('JWT'),
      }).unknown(),
    },
    auth: {
      strategy: 'api-user-jwt',
    },
  },
  handler: async (request, h) => {
    const { Token } = request.models()
    const { user } = request.auth.credentials

    await Token.query()
      .where({ userId: user.id, type: 'auth' })
      .delete()

    return h.response().code(204)
  },
}
