import { UserInputError, AuthenticationError } from 'apollo-server-express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as Yup from 'yup';

import { JWT_PRIVATE_KEY } from '../utils/config';
import UserModel, { User } from '../models/user';
import { UserInContext } from '../utils/types';
import { isError } from '../utils/typeguards';
import Logger from '../utils/logger';
import logger from '../utils/logger';

interface EditUser {
  email?: string;
  oldPassword?: string;
  newPassword?: string;
}

const createUserValidation = Yup.object().shape({
  username: Yup.string()
    .min(3, 'username must be at least 3 characters')
    .required('username required'),
  email: Yup.string()
    .email('email must be valid e-mail')
    .required('email required'),
  fullname: Yup.string().required('full name required'),
  password: Yup.string()
    .min(5, 'password must be at least 5 characters')
    .required('password required'),
});

const emailChangeValidation = Yup.object().shape({
  email: Yup.string()
    .email('email must be valid e-mail')
    .required('email required'),
});

const passwordChangeValidation = Yup.object().shape({
  oldPassword: Yup.string()
    .min(5, 'password must be at least 5 characters')
    .required('password required'),
  newPassword: Yup.string()
    .min(5, 'password must be at least 5 characters')
    .required('password required'),
});

const saltRounds = 10;

export const userResolver = {
  Query: {
    listUsers: async (): Promise<User[]> => {
      return await UserModel.find({}).populate('photos').populate('albums');
    },

    getUser: async (
      _root: undefined,
      args: { username: string }
    ): Promise<User | null> => {
      return await UserModel.findOne({ username: args.username })
        .populate('photos')
        .populate('albums');
    },

    me: async (
      _root: undefined,
      _args: undefined,
      context: UserInContext
    ): Promise<User | null> => {
      return await UserModel.findById(context.currentUser.id)
        .populate({
          path: 'photos',
          populate: {
            path: 'album',
          },
        })
        .populate({
          path: 'albums',
          populate: {
            path: 'photos',
          },
        });
    },
  },

  Mutation: {
    createUser: async (_root: undefined, args: User): Promise<User> => {
      const passwordHash = await bcrypt.hash(args.password, saltRounds);

      try {
        await createUserValidation.validate(args);
      } catch (error) {
        logger.error(error);
        const message = isError(error) ? error.message : '';
        throw new UserInputError(message, { invalidArgs: args });
      }

      const user = new UserModel({
        username: args.username,
        password: passwordHash,
        email: args.email,
        fullname: args.fullname,
        isAdmin: false,
      });

      try {
        await user.save();
      } catch (error) {
        logger.error(error);
        const message = isError(error) ? error.message : '';
        throw new UserInputError(message, { invalidArgs: args });
      }

      return user;
    },

    editUser: async (
      _root: undefined,
      args: EditUser,
      context: UserInContext
    ): Promise<User | null> => {
      const id = context.currentUser.id;

      if (!id) {
        throw new AuthenticationError('Not authenticated');
      }

      let updatedEmail;
      let updatedPassword;

      if (args.email) {
        try {
          await emailChangeValidation.validate(args);
        } catch (error) {
          logger.error(error);
          const message = isError(error) ? error.message : '';
          throw new UserInputError(message, { invalidArgs: args });
        }

        updatedEmail = args.email;
      }

      if (args.oldPassword && args.newPassword) {
        try {
          await passwordChangeValidation.validate(args);
        } catch (error) {
          logger.error(error);
          const message = isError(error) ? error.message : '';
          throw new UserInputError(message, { invalidArgs: args });
        }

        try {
          const user = await UserModel.findById(id);

          const passwordCorrect =
            user === null
              ? false
              : await bcrypt.compare(args.oldPassword, user.password);

          if (!passwordCorrect) {
            throw new UserInputError('Wrong password');
          }

          updatedPassword = await bcrypt.hash(args.newPassword, saltRounds);
        } catch (error) {
          logger.error(error);
          const message = isError(error) ? error.message : '';
          throw new Error(message);
        }
      }

      interface UpdatedObject {
        email?: string;
        password?: string;
      }

      const updatedObject: UpdatedObject = {};

      if (updatedPassword) updatedObject.password = updatedPassword;
      if (updatedEmail) updatedObject.email = updatedEmail;

      try {
        const user = await UserModel.findByIdAndUpdate(
          { _id: id },
          { $set: updatedObject },
          { new: true }
        );

        return user;
      } catch (error) {
        logger.error(error);
        const message = isError(error) ? error.message : '';
        throw new Error(message);
      }
    },

    deleteUser: async (
      _root: undefined,
      args: { username: string },
      context: UserInContext
    ): Promise<User | null> => {
      const user = await UserModel.findOne({ username: args.username });

      if (
        context.currentUser.isAdmin ||
        (user && context.currentUser.id === user.id)
      ) {
        try {
          await UserModel.findByIdAndRemove(user?.id);
        } catch (error) {
          logger.error(error);
          const message = isError(error) ? error.message : '';
          throw new UserInputError(message, { invalidArgs: args });
        }

        return user;
      }

      throw new AuthenticationError('Not authenticated');
    },

    login: async (
      _root: undefined,
      args: { username: string; password: string }
    ): Promise<{ token: string }> => {
      const user = await UserModel.findOne({ username: args.username });
      const passwordCorrect =
        user === null
          ? false
          : await bcrypt.compare(args.password, user.password);

      if (!(user && passwordCorrect)) {
        throw new UserInputError('Wrong credentials');
      }

      const userForToken = {
        username: user.username,
        id: user.id,
      };

      if (JWT_PRIVATE_KEY) {
        return { token: jwt.sign(userForToken, JWT_PRIVATE_KEY) };
      } else {
        Logger.log('JWT_PRIVATE_KEY not specified');
        return { token: '' };
      }
    },
  },
};
