import { gql } from 'apollo-server';

export const typeDefs = gql`
  type Test {
    username: String!
    realname: String!
  }
  type Query {
    testQuery: Test!
  }
`;