import { ApolloServer, gql } from 'apollo-server';
import mongoose from 'mongoose';
import { MONGODB_URI } from './utils/config';
import { isError } from './utils/typeguards';
import Logger from './utils/logger';

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

Logger.log('Connecting to ', MONGODB_URI);

if (MONGODB_URI) {
  void mongoose
    .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      Logger.log('Connected to MongoDB');
    })
    .catch((error) => {
      Logger.log('Could not connect to MongoDB:');
      if (isError(error)) Logger.log(error.message);
    });
} else {
  Logger.error('MONGODB_URI not specified');
}

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
    Logger.log(`Server ready at ${url}`);
  });