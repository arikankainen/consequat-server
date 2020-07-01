import UserModel, { User } from './models/user';

export const resolvers = {
  Query: {
    listUsers: async (): Promise<User[]> => {
      return await UserModel.find({});
    }
  }
};
