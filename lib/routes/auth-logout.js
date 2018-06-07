const Joi = require('joi')

module.exports = {
  method: 'POST',
  path: '/auth/logout',
  config: {
    description: 'Get logged-in user',
    tags: ['api'],
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
    const { token } = request.auth.credentials

    await Token.query().deleteById(token.id)

    return h.response().code(204)
  },
}
