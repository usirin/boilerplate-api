const Joi = require('joi')

module.exports = {
  method: 'POST',
  path: '/auth/reset-password',
  config: {
    validate: {
      payload: {
        email: Joi.string()
          .email()
          .required(),
      },
    },
  },
  handler: async (request, h) => {
    const { email } = request.payload
    const { User, Token } = request.models()

    const user = await User.query().findOne({ email })

    // if we can't find a user with this email, we will send a success. This
    // is to prevent this endpoint to be used as a email validator by very
    // very very bad people.
    if (!user) {
      return h.response().code(200)
    }

    await Token.query().insertAndFetch({
      userId: user.id,
      type: 'reset-password',
    })

    return h.response().code(200)
  },
}
