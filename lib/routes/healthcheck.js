const Pkg = require('../../package.json')

module.exports = {
  method: 'GET',
  path: '/healthcheck',
  config: {
    description: 'Healtcheck endpoint',
    tags: ['api'],
  },
  handler: request => {
    request.log(['log'], 'server is healthy')

    return { status: 'ok', version: Pkg.version }
  },
}
