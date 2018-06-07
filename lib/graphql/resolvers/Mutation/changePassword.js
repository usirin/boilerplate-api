const Boom = require('boom')

module.exports = async (root, { input }, { request }) => {
  const { isAuthenticated, credentials } = request.auth

  if (!isAuthenticated) {
    return Boom.unauthorized()
  }

  const { userService } = request.services(true)

  try {
    const user = await request.transaction(
      async transaction =>
        await userService.login(
          { email: credentials.user.email, password: input.current },
          transaction
        )
    )

    if (user.id !== credentials.user.id) {
      return Boom.unauthorized()
    }

    return await request.transaction(
      async transaction =>
        await userService.changePassword(user.id, input.new, transaction)
    )
  } catch (error) {
    request.log(['error'], error)
    return false
  }
}
