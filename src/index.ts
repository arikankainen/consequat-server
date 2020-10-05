import express from 'express';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-express';
import { IncomingMessage } from 'http';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import path from 'path';
import { MONGODB_URI, JWT_PRIVATE_KEY } from './utils/config';
import { isError } from './utils/typeguards';
import Logger from './utils/logger';
import typeDefs from './schemas/schemas';
import resolvers from './resolvers/resolvers';
import UserModel, { User } from './models/user';
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

const context = async ({
  req,
}: {
  req: IncomingMessage;
}): Promise<{ currentUser: User | null }> => {
  const auth = req ? req.headers.authorization : null;
  let currentUser = null;

  if (auth && auth.toLowerCase().startsWith('bearer ') && JWT_PRIVATE_KEY) {
    const decodedToken = jwt.verify(
      auth.substring(7),
      JWT_PRIVATE_KEY
    ) as UserInToken;
    currentUser = await UserModel.findById(decodedToken.id);
  }

  return { currentUser };
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context,
});

const app = express();
app.use(cors());
app.use(express.static('build'));

if (process.env.NODE_ENV === 'production') {
  app.get('*', (_req, res) => {
    res.sendFile('index.html', { root: path.join(__dirname, '../build/') });
  });
}

server.applyMiddleware({ app });

const port = process.env.PORT || 4000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    Logger.log(`Server ready at http://localhost:${port}`);
    Logger.log(
      `GraphQL playground available at http://localhost:${port}${server.graphqlPath}`
    );
  });
}

export { typeDefs, resolvers, context, ApolloServer, server, mongoose };
