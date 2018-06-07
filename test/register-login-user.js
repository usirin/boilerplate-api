module.exports = exports = (server, expect) => async ({
  email = 'test@test.com',
  username = 'test',
  password = 'password',
} = {}) => {
  const user = await exports.createUser(server, expect)({
    email,
    password,
    username,
  })

  const token = await exports.loginUser(server, expect)({
    email,
    password,
    username,
  })

  return {
    user,
    token,
  }
}

exports.createUser = (server, expect) => async ({
  email = 'test@test.com',
  password = 'password',
  username = 'test',
} = {}) => {
  const options = {
    method: 'POST',
    url: '/auth/register',
    payload: {
      email,
      password,
      username,
    },
  }

  const { result, statusCode } = await server.inject(options)

  expect(statusCode).to.equal(200)
  expect(result.email).to.equal(email)

  return result
}

exports.loginUser = (server, expect) => async ({
  username = 'test',
  password = 'password',
} = {}) => {
  const options = {
    method: 'POST',
    url: '/auth/login',
    payload: {
      username,
      password,
    },
  }

  const { result, statusCode } = await server.inject(options)

  expect(statusCode).to.equal(200)
  expect(result.token).to.be.a.string()

  return result.token
}

exports.logout = (server, expect) => async ({ token }) => {
  const options = {
    method: 'POST',
    url: '/auth/logout',
    headers: {
      authorization: token,
    },
  }

  const { result, statusCode } = await server.inject(options)

  expect(statusCode).to.equal(200)
  expect(result.token).to.be.a.string()

  return result.token
}
