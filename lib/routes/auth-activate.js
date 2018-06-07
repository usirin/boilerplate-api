const Joi = require('joi')
const Boom = require('boom')

module.exports = {
  method: 'POST',
  path: '/auth/activate',
  config: {
    description: 'Activate a user using a register token',
    tags: ['api', 'auth'],
    validate: {
      payload: {
        code: Joi.string()
          .guid()
          .required(),
      },
    },
  },
  handler: async (request, h) => {
    const { code } = request.payload
    const { Token, User } = request.models()

    const token = await Token.query()
      .findById(code)
      .eager('user')

    if (!token) {
      throw Boom.notFound('Token is not found')
    }

    if (!token.user) {
      throw Boom.notFound('User is not found')
    }

    await User.query()
      .patch({ isActive: true })
      .where({ id: token.userId })

    await Token.query().deleteById(code)

    return h.response().code(200)
  },
}
