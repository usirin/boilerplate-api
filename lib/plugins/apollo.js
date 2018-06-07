const requireAll = require('require-all')
const { ApolloServer } = require('apollo-server-hapi')

// The GraphQL schema
const typeDefs = require('../graphql/schema')

// A map of functions which return data for the schema.
const resolvers = requireAll(`${__dirname}/../graphql/resolvers`)

const register = async server => {
  const apollo = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ request, h }) => ({ request, h }),
  })

  await apollo.applyMiddleware({
    app: server,
    route: {
      cors: true,
      auth: {
        strategy: 'api-user-jwt',
        mode: 'try',
      },
    },
  })

  await apollo.installSubscriptionHandlers(server.listener)
}

module.exports = {
  plugins: {
    plugin: {
      name: 'apollo-graphql',
      register: server => {
        server.dependency(
          ['hapi-auth-jwt2', 'schwifty', 'schmervice'],
          register
        )
      },
    },
  },
}
