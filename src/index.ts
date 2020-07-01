import { ApolloServer, gql } from 'apollo-server';

const typeDefs = gql`
  type Test {
    username: String!
    realname: String!
  }
  type Query {
    testQuery: Test!
  }
`;

const resolvers = {
  Query: {
    testQuery: () => {
      return { username: 'testUsername', realname: 'testRealname' };
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

void server
  .listen()
  .then(({ url }) => {
    console.log(`Server ready at ${url}`);
  });