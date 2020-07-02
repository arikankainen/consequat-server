import UserModel, { User } from './models/user';
import { UserInputError, AuthenticationError } from 'apollo-server';
import { isError } from './utils/typeguards';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_PRIVATE_KEY } from './utils/config';
import Logger from './utils/logger';
import { UserInContext } from './utils/types';

export const resolvers = {
  Query: {
    listUsers: async (): Promise<User[]> => {
      return await UserModel.find({});
    }
  },
  Mutation: {
    createUser: async (_root: undefined, args: User): Promise<User|null> => {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(args.password, saltRounds);
      
      const user = new UserModel({
        username: args.username,
        password: passwordHash,
        email: args.email,
        fullname: args.fullname
      });
      try {
        await user.save();
      }
      catch (error) {
        const message = isError(error) ? error.message : '';
        throw new UserInputError(message, { invalidArgs: args });
      }
      return user;
    },

    deleteUser: async (_root: undefined, args: { id: string }, context: UserInContext): Promise<string> => {
      if (context.currentUser.id == args.id)
      {
        try {
          await UserModel.findByIdAndRemove(args.id);
        }
        catch (error) {
          const message = isError(error) ? error.message : '';
          throw new UserInputError(message, { invalidArgs: args });
        }
        return args.id;
      }
      throw new AuthenticationError('Invalid authentication');
    },

    login: async (_root: undefined, args: { username: string, password: string }): Promise<{ token: string }> => {
      const user = await UserModel.findOne({ username: args.username });
      const passwordCorrect = user === null ? false : await bcrypt.compare(args.password, user.password);
      
      if (!(user && passwordCorrect)) {
        throw new UserInputError('wrong credentials');
      }

      const userForToken = {
        username: user.username,
        id: user.id
      };

      if (JWT_PRIVATE_KEY) {
        return { token: jwt.sign(userForToken, JWT_PRIVATE_KEY) };
      }
      else {
        Logger.log('JWT_PRIVATE_KEY not specified');
        return { token: '' };
      }
    }
  }
};
