module.exports = (srv, options) => {
  return {
    name: 'api-user-jwt',
    scheme: 'jwt',
    options: {
      apiUserJwt: true,
      key: options.jwtKey,
      validate,
      verifyOptions: { algorithms: ['HS256'] }, // pick a strong algorithm
    },
  }
}

const validate = async (decoded, request) => {
  const { Token } = request.models(true)

  let token = null

  try {
    token = await Token.query()
      .findById(decoded.id)
      .eager('user')
  } catch (err) {
    request.log(['error'], err)
  }

  const credentials = token
    ? { isValid: true, credentials: { user: token.user, token } }
    : { isValid: false }

  return credentials
}
