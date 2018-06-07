const Boom = require('boom')

module.exports = async (root, args, { request }) => {
  const { auth } = request

  if (!auth.isAuthenticated) {
    return Boom.unauthorized()
  }

  return auth.credentials.user
}
