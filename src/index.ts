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
  resolvers,
  introspection: true,  // to temporarily enable graphql-playground in production mode
  playground: true,     // to temporarily enable graphql-playground in production mode
});

void server
  .listen({ port: process.env.PORT || 4000 })
  .then(({ url }) => {
    console.log(`Server ready at ${url}`);
  });