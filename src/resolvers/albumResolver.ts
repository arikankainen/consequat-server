import { AuthenticationError } from 'apollo-server-express';
import UserModel from '../models/user';
import AlbumModel, { Album } from '../models/album';
import { UserInContext } from '../utils/types';
import { isError } from '../utils/typeguards';
import mongoose from 'mongoose';
import logger from '../utils/logger';

export const albumResolver = {
  Query: {
    listAlbums: async (): Promise<Album[]> => {
      return await AlbumModel.find({}).populate('user').populate('photos');
    },
  },

  Mutation: {
    createAlbum: async (
      _root: undefined,
      args: Album,
      context: UserInContext
    ): Promise<Album | null> => {
      const currentUser = context.currentUser;

      if (!currentUser) {
        throw new AuthenticationError('Not authenticated');
      }

      const album = new AlbumModel({
        name: args.name,
        description: args.description,
        user: currentUser.id,
      });

      const user = await UserModel.findById(currentUser.id);
      let populatedAlbum: Album | null = null;

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        if (user) {
          user.albums = user.albums.concat(album.id);
          await user.save();
        }

        await album.save();
        populatedAlbum = await album.populate('user').execPopulate();
        await session.commitTransaction();
      } catch (error) {
        await session.abortTransaction();

        logger.error(error);
        const message = isError(error) ? error.message : '';
        throw new Error(message);
      } finally {
        session.endSession();
      }

      return populatedAlbum;
    },

    deleteAlbum: async (
      _root: undefined,
      args: { id: string },
      context: UserInContext
    ): Promise<Album | null> => {
      const currentUser = context.currentUser;
      const id = args.id;
      const isOwnAlbum = currentUser.albums.includes(id);

      if (!currentUser || (!currentUser.isAdmin && !isOwnAlbum)) {
        throw new AuthenticationError('Not authenticated');
      }

      const session = await mongoose.startSession();
      session.startTransaction();

      const album = await AlbumModel.findById(args.id);

      try {
        await AlbumModel.findByIdAndDelete(args.id, { session });

        await UserModel.findByIdAndUpdate(
          { _id: currentUser.id },
          { $pullAll: { albums: [id] } },
          { session }
        );

        await session.commitTransaction();
      } catch (error) {
        await session.abortTransaction();

        logger.error(error);
        const message = isError(error) ? error.message : '';
        throw new Error(message);
      } finally {
        session.endSession();
      }

      return album;
    },

    editAlbum: async (
      _root: undefined,
      args: Album,
      context: UserInContext
    ): Promise<Album | null> => {
      const currentUser = context.currentUser;
      const id = args.id;
      const isOwnAlbum = currentUser.albums.includes(id);

      if (!currentUser || (!currentUser.isAdmin && !isOwnAlbum)) {
        throw new AuthenticationError('Not authenticated');
      }

      const album = await AlbumModel.findById(args.id);

      if (album) {
        album.name = args.name ? args.name : '';
        album.description = args.description ? args.description : '';

        try {
          await album.save();
        } catch (error) {
          logger.error(error);
          const message = isError(error) ? error.message : '';
          throw new Error(message);
        }
      }

      return album;
    },
  },
};
