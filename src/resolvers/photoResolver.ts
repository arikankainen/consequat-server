//import Logger from '../utils/logger';

import { ValidationError, AuthenticationError } from 'apollo-server-express';
import PhotoModel, { Photo } from '../models/photo';
import { UserInContext } from '../utils/types';
import { isError } from '../utils/typeguards';

export const photoResolver = {
  Query: {
    listPhotos: async (_root: undefined, _args: undefined): Promise<Photo[]> => {
      return await PhotoModel.find({}).populate('user');
    }
  },
  Mutation: {
    addPhoto: async (_root: undefined, args: Photo, context: UserInContext): Promise<Photo | null> => {
      if (context.currentUser) {
        const photo = new PhotoModel({
          mainUrl: args.mainUrl,
          thumbUrl: args.thumbUrl,
          name: args.name,
          user: context.currentUser.id,
        });

        try {
          await photo.save();
        }
        catch (error) {
          const message = isError(error) ? error.message : '';
          throw new ValidationError(message);
        }

        return await photo.populate('user').execPopulate();
      }

      throw new AuthenticationError('Not authenticated');
    }
  },
};
