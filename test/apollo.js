/* eslint-disable max-nested-callbacks */
// Load modules

const Code = require('code')
const Lab = require('lab')
const Server = require('../server')

// Test shortcuts

exports.lab = Lab.script()

const { describe, it, before } = exports.lab
const { expect } = Code

let server = null

describe('apollo-graphql', () => {
  before(async () => {
    server = await Server.deployment()
  })

  it('registers graphql playground', async () => {
    const options = {
      method: 'POST',
      url: '/graphql',
      payload: {
        query: 'query { isReady }',
      },
    }

    const res = await server.inject(options)

    expect(res.statusCode).to.equal(200)

    const { data } = JSON.parse(res.result)

    expect(data.isReady).to.equal(true)
  })
})
