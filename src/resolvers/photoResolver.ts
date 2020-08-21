//import Logger from '../utils/logger';

import { AuthenticationError } from 'apollo-server-express';
import PhotoModel, { Photo } from '../models/photo';
import UserModel from '../models/user';
import { UserInContext } from '../utils/types';
import { isError } from '../utils/typeguards';

export const photoResolver = {
  Query: {
    listPhotos: async (): Promise<Photo[]> => {
      return await PhotoModel.find({}).populate('user');
    }
  },

  Mutation: {
    addPhoto: async (_root: undefined, args: Photo, context: UserInContext): Promise<Photo | null> => {
      const currentUser = context.currentUser;

      if (!currentUser) {
        throw new AuthenticationError('Not authenticated');
      }

      const photo = new PhotoModel({
        mainUrl: args.mainUrl,
        thumbUrl: args.thumbUrl,
        filename: args.filename,
        thumbFilename: args.thumbFilename,
        originalFilename: args.originalFilename,
        name: args.name,
        description: args.description,
        user: currentUser.id,
      });

      const user = await UserModel.findById(currentUser.id);
      if (user) {
        user.photos = user.photos.concat(photo.id);
        try {
          await user.save();
        } catch (error) {
          const message = isError(error) ? error.message : '';
          throw new Error(message);
        }
      }

      try {
        await photo.save();
      } catch (error) {
        const message = isError(error) ? error.message : '';
        throw new Error(message);
      }

      return await photo.populate('user').execPopulate();
    },

    deletePhoto: async (_root: undefined, args: { id: string }, context: UserInContext): Promise<Photo | null> => {
      const currentUser = context.currentUser;
      const id = args.id;
      const isOwnPhoto = currentUser.photos.includes(id);

      if (!currentUser || (!currentUser.isAdmin && !isOwnPhoto)) {
        throw new AuthenticationError('Not authenticated');
      }

      const photo = await PhotoModel.findByIdAndDelete(args.id);
      await UserModel.findByIdAndUpdate({ _id: currentUser.id }, { $pullAll: { photos: [id] } });

      return photo;
    },

    editPhoto: async (_root: undefined, args: Photo, context: UserInContext): Promise<Photo | null> => {
      const currentUser = context.currentUser;
      const id = args.id;
      const isOwnPhoto = currentUser.photos.includes(id);

      if (!currentUser || (!currentUser.isAdmin && !isOwnPhoto)) {
        throw new AuthenticationError('Not authenticated');
      }

      const photo = await PhotoModel.findById(args.id);

      if (photo) {
        if (args.name) photo.name = args.name;
        if (args.description) photo.description = args.description;

        try {
          await photo.save();
        } catch (error) {
          const message = isError(error) ? error.message : '';
          throw new Error(message);
        }
      }

      return photo;
    },
  },
};
