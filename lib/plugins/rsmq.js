const RsmqWorker = require('rsmq-worker')

module.exports = (server, options) => ({
  plugins: {
    plugin: {
      name: 'rsmq',
      register,
    },
    options: options.rsmq,
  },
})

const register = async (server, options) => {
  const { host, port } = options

  const workers = {}

  server.decorate('server', 'worker', (name, options, onMessage, events) => {
    const worker = new RsmqWorker(name, {
      ...options,
      host,
      port,
    })

    events = {
      ...events,
      message: (msg, next, id) => {
        console.log('here', msg, id)

        onMessage(server, msg, id)
          .then(next)
          .catch(next)
      },
    }

    Object.keys(events).forEach(event => {
      worker.on(event, events[event])
    })

    workers[name] = worker
  })

  server.decorate('server', 'workers', () => workers)
}
