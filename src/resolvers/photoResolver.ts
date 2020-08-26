import { AuthenticationError } from 'apollo-server-express';
import PhotoModel, { Photo } from '../models/photo';
import UserModel from '../models/user';
import AlbumModel from '../models/album';
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
        location: args.location,
        description: args.description,
        album: args.album,
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

      if (args.album) {
        const album = await AlbumModel.findById(args.album);
        if (album) {
          album.photos = album.photos.concat(photo.id);
          try {
            await album.save();
          } catch (error) {
            const message = isError(error) ? error.message : '';
            throw new Error(message);
          }
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

      if (photo) {
        await AlbumModel.findByIdAndUpdate({ _id: photo.album }, { $pullAll: { photos: [id] } });
      }

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
        const oldAlbum = photo.album;
        const newAlbum = args.album;

        if (oldAlbum !== newAlbum) {
          if (oldAlbum) {
            await AlbumModel.findByIdAndUpdate({ _id: oldAlbum }, { $pull: { photos: id } });
          }
          if (newAlbum) {
            await AlbumModel.findByIdAndUpdate({ _id: newAlbum }, { $push: { photos: id } });
          }
        }

        photo.name = args.name ? args.name : '';
        photo.location = args.location ? args.location : '';
        photo.album = args.album ? args.album : '';
        photo.description = args.description ? args.description : '';

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
