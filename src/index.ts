import { ApolloServer } from 'apollo-server';
import mongoose from 'mongoose';
import { MONGODB_URI, JWT_PRIVATE_KEY } from './utils/config';
import { isError } from './utils/typeguards';
import Logger from './utils/logger';
import { typeDefs } from './typeDefs';
import { resolvers } from './resolvers';
import jwt from 'jsonwebtoken';
import UserModel from './models/user';
import { UserInToken } from './utils/types';

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
  Logger.error('MONGODB_URI not specified');
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,  // to temporarily enable graphql-playground in production mode
  playground: true,     // to temporarily enable graphql-playground in production mode
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null;
    if (auth && auth.toLowerCase().startsWith('bearer ') && JWT_PRIVATE_KEY) {
      const decodedToken = (jwt.verify(auth.substring(7), JWT_PRIVATE_KEY) as UserInToken);
      const currentUser = await UserModel.findById(decodedToken.id);
      return { currentUser };
    }
  }
});

void server
  .listen({ port: process.env.PORT || 4000 })
  .then(({ url }) => {
    Logger.log(`Server ready at ${url}`);
  });