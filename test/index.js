/* eslint-disable max-nested-callbacks */
// Load modules

const Code = require('code')
const Lab = require('lab')
const Server = require('../server')
const Package = require('../package.json')

// Test shortcuts

exports.lab = Lab.script()

const { describe, it, before, after } = exports.lab
const { expect } = Code

let server = null
let token = null

describe('Deployment', () => {
  before(async () => {
    server = await Server.deployment()
  })

  after(async () => {
    const knex = server.knex()

    return await knex('users').del()
  })

  it('registers the main plugin.', async () => {
    expect(server.registrations[Package.name]).to.exist()
  })

  it('creates a new user', async () => {
    const options = {
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: 'new-user@test.com',
        password: 'password',
        username: 'newuser',
      },
    }

    const res = await server.inject(options)

    expect(res.statusCode).to.equal(200)
    expect(res.result.email).to.equal('new-user@test.com')
  })

  it('creates a register token for a new user', async () => {
    const options = {
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: 'register-token@test.com',
        password: 'register',
        username: 'registertoken',
      },
    }

    const { statusCode, result } = await server.inject(options)

    expect(statusCode).to.equal(200)

    const { Token } = server.models()

    const token = await Token.query()
      .where({ userId: result.id })
      .first()

    expect(token.type).to.equal('register')
  })

  it('fails with already registered user', async () => {
    const options = {
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: 'already-registered@test.com',
        password: 'password',
        username: 'alreadyregistered',
      },
    }

    // first call to the server should create the user
    const res1 = await server.inject(options)
    expect(res1.statusCode).to.equal(200)

    // second call should return an error
    const res2 = await server.inject(options)
    expect(res2.statusCode).to.equal(400)
  })

  it('logs a user in using username', async () => {
    const registerOptions = {
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: 'login-with-user@test.com',
        password: 'password',
        username: 'loginwithuser',
      },
    }

    // first call to the server should create the user
    const registerReq = await server.inject(registerOptions)
    expect(registerReq.statusCode).to.equal(200)

    const loginUsername = {
      method: 'POST',
      url: '/auth/login',
      payload: {
        username: 'loginwithuser',
        password: 'password',
      },
    }

    const loginUsernameReq = await server.inject(loginUsername)

    expect(loginUsernameReq.statusCode).to.equal(200)
    expect(loginUsernameReq.result.token).to.be.a.string()

    const loginEmail = {
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: 'login-with-user@test.com',
        password: 'password',
      },
    }

    const loginEmailReq = await server.inject(loginEmail)

    expect(loginEmailReq.statusCode).to.equal(200)
    expect(loginEmailReq.result.token).to.be.a.string()

    // save this for later use
    token = loginEmailReq.result.token
  })

  it('fails with wrong credentials', async () => {
    const options = {
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: 'obviously@wrong.com',
        password: 'password',
      },
    }

    const { statusCode } = await server.inject(options)

    expect(statusCode).to.equal(401)
  })

  it('fails with wrong password', async () => {
    const options = {
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: 'test@test.com',
        password: 'wrong-password',
      },
    }

    const { statusCode } = await server.inject(options)

    expect(statusCode).to.equal(401)
  })

  it('fetches logged in user', async () => {
    const options = {
      method: 'GET',
      url: '/auth/user',
      headers: {
        authorization: token,
      },
    }

    const res = await server.inject(options)

    expect(res.statusCode).to.equal(200)
    expect(res.result.email).to.equal('login-with-user@test.com')
  })

  it('activates user', async () => {
    const options = {
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: 'activate@test.com',
        password: 'password',
        username: 'activate',
      },
    }

    let { result, statusCode } = await server.inject(options)

    expect(statusCode).to.equal(200)
    expect(result.email).to.equal('activate@test.com')
    expect(result.isActive).to.equal(false)

    const { Token, User } = server.models()

    const token = await Token.query()
      .where({ userId: result.id })
      .first()

    const activateOptions = {
      method: 'POST',
      url: '/auth/activate',
      payload: {
        code: token.id,
      },
    }

    await server.inject(activateOptions)

    const user = await User.query().findById(result.id)

    expect(user.isActive).to.equal(true)
  })

  describe('Password reset', () => {
    let user = null
    let resetToken = null

    it('accepts a request to reset password', async () => {
      let options = {
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: 'reset@password.com',
          password: 'reset-password',
          username: 'reset',
        },
      }

      let { statusCode, result } = await server.inject(options)
      expect(statusCode).to.equal(200)

      user = result

      options = {
        method: 'POST',
        url: '/auth/reset-password',
        payload: {
          email: 'reset@password.com',
        },
      }

      await server.inject(options)

      const { Token } = server.models()

      resetToken = await Token.query()
        .where({ userId: user.id, type: 'reset-password' })
        .first()

      expect(resetToken).to.be.an.object()
    })

    it('changes password with a reset token', async () => {
      const { Token } = server.models()

      let options = {
        method: 'POST',
        url: '/auth/change-password',
        payload: {
          tid: resetToken.id,
          password: 'changed-password',
        },
      }

      const { statusCode } = await server.inject(options)

      expect(statusCode).to.equal(204)

      options = {
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'reset@password.com',
          password: 'changed-password',
        },
      }

      const { statusCode: loginStatus } = await server.inject(options)

      expect(loginStatus).to.equal(200)

      const res = await Token.query().findById(resetToken.id)

      expect(res).to.equal(undefined)
    })
  })

  describe('Logout operation', () => {
    let loginTokens = []

    before(async () => {
      const options = {
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'login-with-user@test.com',
          password: 'password',
        },
      }

      // login 3 times so that logout all tests would have data beforehand.
      const results = await Promise.all([
        server.inject(options),
        server.inject(options),
        server.inject(options),
      ])

      loginTokens = results.map(({ result: { token } }) => token)
    })

    it('logs user out of given session', async () => {
      const options = {
        method: 'POST',
        url: '/auth/logout',
        headers: {
          authorization: loginTokens[0],
        },
      }

      const { statusCode } = await server.inject(options)

      expect(statusCode).to.equal(204)

      // assert that first token is not valid anymore
      const fetchOptions = {
        method: 'GET',
        url: '/auth/user',
        headers: {
          authorization: loginTokens[0],
        },
      }

      const { statusCode: fetchStatusCode } = await server.inject(fetchOptions)

      expect(fetchStatusCode).to.equal(401)

      // assert that second token is still valid
      const secondFetch = {
        method: 'GET',
        url: '/auth/user',
        headers: {
          authorization: loginTokens[1],
        },
      }

      const { statusCode: secondStatus } = await server.inject(secondFetch)

      expect(secondStatus).to.equal(200)
    })

    it('logs out all sessions', async () => {
      // logout using second token
      const options = {
        method: 'POST',
        url: '/auth/logout-all',
        headers: {
          authorization: loginTokens[1],
        },
      }

      const { statusCode } = await server.inject(options)

      expect(statusCode).to.equal(204)

      // assert that second token is not valid anymore
      const fetchOptions = {
        method: 'GET',
        url: '/auth/user',
        headers: {
          authorization: loginTokens[1],
        },
      }

      const { statusCode: fetchStatusCode } = await server.inject(fetchOptions)

      expect(fetchStatusCode).to.equal(401)

      // assert that third token is also not valid
      const secondFetch = {
        method: 'GET',
        url: '/auth/user',
        headers: {
          authorization: loginTokens[2],
        },
      }

      const { statusCode: secondStatus } = await server.inject(secondFetch)

      expect(secondStatus).to.equal(401)
    })
  })
})
