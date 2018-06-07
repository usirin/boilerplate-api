module.exports = {
  name: 'email',
  options: {
    autostart: true,
  },
  onMessage: async (server, msg, id) => {
    console.log({ msg, id })
  },
}
