import { gql } from 'apollo-server';

export const typeDefs = gql`
  type User {
    username: String!
    password: String!
    email: String!
    fullname: String!
    isAdmin: Boolean!
    id: ID!
  }

  type Token {
    token: String!
  }

  type Query {
    me: User
    listUsers: [User!]
    getUser(username: String): User!
  }
  
  type Mutation {
    createUser(
      username: String!
      password: String!
      email: String!
      fullname: String!
    ): User

    deleteUser(
      username: String!
    ): User

    login(
      username: String!
      password: String!
    ): Token
  }
`;