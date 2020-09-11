import { AuthenticationError } from 'apollo-server-express';
import PhotoModel, { Photo } from '../models/photo';
import UserModel from '../models/user';
import AlbumModel from '../models/album';
import { UserInContext } from '../utils/types';
import { isError } from '../utils/typeguards';
import mongoose from 'mongoose';
import logger from '../utils/logger';

interface Photo2 {
  mainUrl?: string;
  thumbUrl?: string;
  filename?: string;
  thumbFilename?: string;
  originalFilename?: string;
  width?: number;
  height?: number;
  name?: string;
  location?: string;
  description?: string;
  tags?: string[];
  dateAdded?: string;
  album?: string;
  id: string[];
}

export const photoResolver = {
  Query: {
    listPhotos: async (): Promise<Photo[]> => {
      return await PhotoModel.find({}).populate('user').populate('album');
    },
  },

  Mutation: {
    addPhoto: async (
      _root: undefined,
      args: Photo,
      context: UserInContext
    ): Promise<Photo | null> => {
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
        width: args.width,
        height: args.height,
        name: args.name || '',
        location: args.location || '',
        description: args.description || '',
        tags: args.tags || [],
        album: args.album || null,
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

    deletePhoto: async (
      _root: undefined,
      args: { id: string },
      context: UserInContext
    ): Promise<Photo | null> => {
      const currentUser = context.currentUser;
      const id = args.id;
      const isOwnPhoto = currentUser.photos.includes(id);

      if (!currentUser || (!currentUser.isAdmin && !isOwnPhoto)) {
        throw new AuthenticationError('Not authenticated');
      }
      const photo = await PhotoModel.findByIdAndDelete(args.id);
      if (photo && photo.user) {
        await UserModel.findByIdAndUpdate(
          { _id: photo.user },
          { $pullAll: { photos: [id] } }
        );
      }

      if (photo && photo.album) {
        await AlbumModel.findByIdAndUpdate(
          { _id: photo.album },
          { $pullAll: { photos: [id] } }
        );
      }

      return photo;
    },

    editPhoto: async (
      _root: undefined,
      args: Photo,
      context: UserInContext
    ): Promise<Photo | null> => {
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

        if (oldAlbum?.toString() !== newAlbum?.toString()) {
          if (oldAlbum) {
            await AlbumModel.findByIdAndUpdate(
              { _id: oldAlbum },
              { $pull: { photos: id } }
            );
          }
          if (newAlbum) {
            await AlbumModel.findByIdAndUpdate(
              { _id: newAlbum },
              { $push: { photos: id } }
            );
          }
        }
        photo.name = args.name ? args.name : '';
        photo.location = args.location ? args.location : '';
        photo.album = args.album ? args.album : null;
        photo.description = args.description ? args.description : '';
        photo.tags = args.tags ? args.tags : [];

        try {
          await photo.save();
        } catch (error) {
          const message = isError(error) ? error.message : '';
          throw new Error(message);
        }
      }

      return photo;
    },

    editPhotos: async (
      _root: undefined,
      args: Photo2,
      context: UserInContext
    ): Promise<Photo[] | null> => {
      const currentUser = context.currentUser;
      const id = args.id;

      const isOwnPhoto = id.every((value) => currentUser.photos.includes(value));

      if (!currentUser || (!currentUser.isAdmin && !isOwnPhoto)) {
        throw new AuthenticationError('Not authenticated');
      }

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        if (args.album !== undefined) {
          await AlbumModel.updateMany(
            { photos: { $in: id } },
            { $pullAll: { photos: id } }
          );

          if (args.album !== null) {
            await AlbumModel.updateMany(
              { _id: args.album },
              { $push: { photos: { $each: id } } }
            );
          }
        }

        const fields = { ...args };
        delete fields['id'];

        await PhotoModel.updateMany({ _id: { $in: args.id } }, { $set: fields });

        await session.commitTransaction();
      } catch (error) {
        logger.error(error);

        await session.abortTransaction();
      } finally {
        session.endSession();
      }

      const photos = await PhotoModel.find({ _id: { $in: args.id } });
      return photos;
    },
  },
};
