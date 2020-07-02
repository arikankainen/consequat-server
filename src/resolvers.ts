import UserModel, { User } from './models/user';
import { UserInputError } from 'apollo-server';
import { isError } from './utils/typeguards';

export const resolvers = {
  Query: {
    listUsers: async (): Promise<User[]> => {
      return await UserModel.find({});
    }
  },
  Mutation: {
    createUser: async (_root: undefined, args: User): Promise<User|null> => {
      const user = new UserModel({
        username: args.username,
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
    deleteUser: async (_root: undefined, args: { id: string }): Promise<string> => {
      try {
        await UserModel.findByIdAndRemove(args.id);
      }
      catch (error) {
        const message = isError(error) ? error.message : '';
        throw new UserInputError(message, { invalidArgs: args });
      }
      return args.id;
    }
  }
};
