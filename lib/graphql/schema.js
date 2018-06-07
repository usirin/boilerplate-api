const { gql } = require('apollo-server-hapi')

module.exports = gql`
  type User {
    id: ID!
    username: String!
    email: String!
  }

  type Query {
    isReady: Boolean
    viewer: User
  }

  input ChangePasswordInput {
    current: String
    new: String
  }

  type Mutation {
    changePassword(input: ChangePasswordInput): Boolean
  }
`
