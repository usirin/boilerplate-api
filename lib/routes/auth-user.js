const Joi = require('joi')

module.exports = {
  method: 'GET',
  path: '/auth/user',
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
  handler: ({ auth }) => {
    return auth.credentials.user
  },
}
