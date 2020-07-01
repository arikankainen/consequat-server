import { ApolloServer } from 'apollo-server';
import mongoose from 'mongoose';
import { MONGODB_URI } from './utils/config';
import { isError } from './utils/typeguards';
import Logger from './utils/logger';
import { typeDefs } from './typeDefs';
import { resolvers } from './resolvers';

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

if (MONGODB_URI) {
  Logger.log('Connecting to ', MONGODB_URI);

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
  Logger.error('MongoDB not specified');
}

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