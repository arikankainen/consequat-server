import { gql } from 'apollo-server';

export const typeDefs = gql`
  type User {
    username: String!
    email: String!
    fullname: String!
    id: ID!
  }
  type Query {
    listUsers: [User!]
  }
  type Mutation {
    createUser(
      username: String!
      email: String!
      fullname: String!
    ): User
    deleteUser(
      id: ID!
    ): ID
  }
`;