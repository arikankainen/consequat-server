import { gql } from 'apollo-server';

export const typeDefs = gql`
  type User {
    username: String!
    password: String!
    email: String!
    fullname: String!
    id: ID!
  }

  type Token {
    token: String!
  }

  type Query {
    listUsers: [User!]
  }
  
  type Mutation {
    createUser(
      username: String!
      password: String!
      email: String!
      fullname: String!
    ): User

    deleteUser(
      id: ID!
    ): ID

    login(
      username: String!
      password: String!
    ): Token
  }
`;