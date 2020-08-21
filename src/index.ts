import express from 'express';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-express';
import mongoose from 'mongoose';
import { MONGODB_URI, JWT_PRIVATE_KEY } from './utils/config';
import { isError } from './utils/typeguards';
import Logger from './utils/logger';
import typeDefs from './schemas/schemas';
import resolvers from './resolvers/resolvers';
import jwt from 'jsonwebtoken';
import UserModel, { User } from './models/user';
import { UserInToken } from './utils/types';
import { IncomingMessage } from 'http';
import path from 'path';

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

const context = async ({ req }: { req: IncomingMessage }): Promise<{ currentUser: User | null }> => {
  const auth = req ? req.headers.authorization : null;
  let currentUser = null;

  if (auth && auth.toLowerCase().startsWith('bearer ') && JWT_PRIVATE_KEY) {
    const decodedToken = (jwt.verify(auth.substring(7), JWT_PRIVATE_KEY) as UserInToken);
    currentUser = await UserModel.findById(decodedToken.id);
  }

  return { currentUser };
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,  // to temporarily enable graphql-playground in production mode
  playground: true,     // to temporarily enable graphql-playground in production mode
  context
});

const app = express();
app.use(cors());
app.use(express.static('build'));

// allaoleva estää GraphQL playgroundin toiminnan, mutta ilman sitä ei toimi herokussa refreshaus
app.get('*', (_req, res) => {
  res.sendFile('index.html', { root: path.join(__dirname, '../build/') });
});


server.applyMiddleware({ app });

const port = process.env.PORT || 4000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    Logger.log(`Server ready at http://localhost:${port}`);
    Logger.log(`GraphQL playground available at http://localhost:${port}${server.graphqlPath}`);
  });
}

/* // to use without 'express'
if (process.env.NODE_ENV !== 'test') {
  void server
    .listen({ port: process.env.PORT || 4000 })
    .then(({ url }) => {
      Logger.log(`Server ready at ${url}`);
    });
}
*/

export {
  typeDefs,
  resolvers,
  context,
  ApolloServer,
  server,
  mongoose
};