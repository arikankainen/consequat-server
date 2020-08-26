import { AuthenticationError } from 'apollo-server-express';
import UserModel from '../models/user';
import AlbumModel, { Album } from '../models/album';
import { UserInContext } from '../utils/types';
import { isError } from '../utils/typeguards';

export const albumResolver = {
  Query: {
    listAlbums: async (): Promise<Album[]> => {
      return await AlbumModel.find({}).populate('user').populate('photo');
    }
  },

  Mutation: {
    createAlbum: async (_root: undefined, args: Album, context: UserInContext): Promise<Album | null> => {
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
      if (user) {
        user.albums = user.albums.concat(album.id);
        try {
          await user.save();
        } catch (error) {
          const message = isError(error) ? error.message : '';
          throw new Error(message);
        }
      }

      try {
        await album.save();
      } catch (error) {
        const message = isError(error) ? error.message : '';
        throw new Error(message);
      }

      return await album.populate('user').execPopulate();
    },

    deleteAlbum: async (_root: undefined, args: { id: string }, context: UserInContext): Promise<Album | null> => {
      const currentUser = context.currentUser;
      const id = args.id;
      const isOwnAlbum = currentUser.albums.includes(id);

      if (!currentUser || (!currentUser.isAdmin && !isOwnAlbum)) {
        throw new AuthenticationError('Not authenticated');
      }

      const album = await AlbumModel.findByIdAndDelete(args.id);
      await UserModel.findByIdAndUpdate({ _id: currentUser.id }, { $pullAll: { albums: [id] } });

      return album;
    },

    editAlbum: async (_root: undefined, args: Album, context: UserInContext): Promise<Album | null> => {
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
          const message = isError(error) ? error.message : '';
          throw new Error(message);
        }
      }

      return album;
    },
  },
};
