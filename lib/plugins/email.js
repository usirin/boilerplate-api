const { MailService } = require('@sendgrid/mail')

const send = instance => async (...args) => {
  return instance.send(...args)
}

const register = async (server, options) => {
  const sendgrid = new MailService()

  sendgrid.setApiKey(options.secret)

  const _send = send(sendgrid)

  server.decorate('server', 'email', _send)
  server.decorate('request', 'email', _send)
}

module.exports = (server, options) => ({
  plugins: {
    plugin: {
      name: 'email',
      register,
    },
    options: options.email,
  },
})
