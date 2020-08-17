import { UserInputError, AuthenticationError } from 'apollo-server-express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { JWT_PRIVATE_KEY } from '../utils/config';
import UserModel, { User } from '../models/user';
import { UserInContext } from '../utils/types';
import { isError } from '../utils/typeguards';
import Logger from '../utils/logger';

export const userResolver = {
  Query: {
    listUsers: async (): Promise<User[]> => {
      return await UserModel.find({}).populate('photos');
    },

    getUser: async (_root: undefined, args: { username: string }): Promise<User | null> => {
      return await UserModel.findOne({ username: args.username }).populate('photos');
    },

    me: async (_root: undefined, _args: undefined, context: UserInContext): Promise<User | null> => {
      return await UserModel.findById(context.currentUser.id).populate('photos');
    }
  },
  Mutation: {
    createUser: async (_root: undefined, args: User): Promise<User> => {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(args.password, saltRounds);

      const user = new UserModel({
        username: args.username,
        password: passwordHash,
        email: args.email,
        fullname: args.fullname,
        isAdmin: false
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

    deleteUser: async (_root: undefined, args: { username: string }, context: UserInContext): Promise<User | null> => {
      const user = await UserModel.findOne({ username: args.username });

      if (context.currentUser.isAdmin || (user && context.currentUser.id == user.id)) {
        try {
          await UserModel.findByIdAndRemove(user?.id);
        }
        catch (error) {
          const message = isError(error) ? error.message : '';
          throw new UserInputError(message, { invalidArgs: args });
        }

        return user;
      }

      throw new AuthenticationError('Not authenticated');
    },

    login: async (_root: undefined, args: { username: string, password: string }): Promise<{ token: string }> => {
      const user = await UserModel.findOne({ username: args.username });
      const passwordCorrect = user === null ? false : await bcrypt.compare(args.password, user.password);

      if (!(user && passwordCorrect)) {
        throw new UserInputError('Wrong credentials');
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
