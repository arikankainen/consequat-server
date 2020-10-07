import { AuthenticationError } from 'apollo-server-express';
import PhotoModel, { Exif, Photo } from '../models/photo';
import UserModel from '../models/user';
import AlbumModel from '../models/album';
import CommentModel from '../models/comment';
import { UserInContext } from '../utils/types';
import { isError } from '../utils/typeguards';
import mongoose from 'mongoose';
import logger from '../utils/logger';

interface EditPhotosArgs {
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
  hidden?: boolean;
  tags?: string[];
  dateAdded?: string;
  album?: string;
  exif?: Exif;
  id?: string[];
}

interface EditTagsArgs {
  addedTags?: string[];
  deletedTags?: string[];
  id?: string[];
}

type TypeSelector = 'name' | 'location' | 'description' | 'tags';

interface ListPhotosArgs {
  type?: TypeSelector[];
  keyword?: string;
  limit?: number;
  offset?: number;
}

export const photoResolver = {
  Query: {
    listPhotos: async (
      _root: undefined,
      args: ListPhotosArgs
    ): Promise<Photo[]> => {
      const type = args.type;
      const keyword = args.keyword;
      const limit = args.limit || 0;
      const offset = args.offset || 0;

      interface SearchOptions {
        $regex: string;
        $options: string;
      }

      interface SearchCondition {
        name?: SearchOptions;
        location?: SearchOptions;
        description?: SearchOptions;
        tags?: SearchOptions;
      }

      interface SearchQuery {
        $or?: SearchCondition[];
      }

      let searchQuery: SearchQuery = {};

      if (keyword && type && type.length > 0) {
        const searchOptions = { $regex: keyword, $options: 'i' };
        const searchArray: SearchCondition[] = [];

        if (type.includes('name')) {
          searchArray.push({ name: searchOptions });
        }
        if (type.includes('location')) {
          searchArray.push({ location: searchOptions });
        }
        if (type.includes('description')) {
          searchArray.push({ description: searchOptions });
        }
        if (type.includes('tags')) {
          searchArray.push({ tags: searchOptions });
        }

        searchQuery = { $or: searchArray };
      }

      return await PhotoModel.find({
        $and: [searchQuery, { hidden: false }],
      })
        .skip(offset)
        .limit(limit)
        .populate('user')
        .populate('album');

      // return await PhotoModel.find({
      //   $and: [
      //     {
      //       $or: [
      //         { name: { $regex: keyword, $options: 'i' } },
      //         { location: { $regex: keyword, $options: 'i' } },
      //         { description: { $regex: keyword, $options: 'i' } },
      //         { tags: { $regex: keyword, $options: 'i' } },
      //       ],
      //     },
      //     { hidden: false },
      //   ],
      // })
      //   .populate('user')
      //   .populate('album');
    },

    getPhoto: async (
      _root: undefined,
      args: { id: string }
    ): Promise<Photo | null> => {
      const id = args.id;

      return await PhotoModel.findOne({
        $and: [{ _id: id }, { hidden: false }],
      })
        .populate('user')
        .populate('album');
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
        hidden: args.hidden !== undefined ? args.hidden : true,
        tags: args.tags || [],
        album: args.album || null,
        user: currentUser.id,
        exif: args.exif,
      });

      let populatedPhoto: Photo | null = null;

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const user = await UserModel.findById(currentUser.id, null, {
          session,
        });

        if (user) {
          user.photos = user.photos.concat(photo.id);
          await user.save({ session });
        }

        if (args.album) {
          const album = await AlbumModel.findById(args.album, null, {
            session,
          });

          if (album) {
            album.photos = album.photos.concat(photo.id);
            await album.save({ session });
          }
        }

        await photo.save({ session });
        populatedPhoto = await photo.populate('user').execPopulate();
        await session.commitTransaction();
      } catch (error) {
        await session.abortTransaction();

        logger.error(error);
        const message = isError(error) ? error.message : '';
        throw new Error(message);
      } finally {
        session.endSession();
      }

      return populatedPhoto;
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

      const session = await mongoose.startSession();
      session.startTransaction();

      const photo = await PhotoModel.findById(args.id);

      try {
        await PhotoModel.findByIdAndDelete(args.id, { session });
        await CommentModel.deleteMany({ photo: id }, { session });

        if (photo && photo.user) {
          await UserModel.findByIdAndUpdate(
            { _id: photo.user },
            { $pullAll: { photos: [id] } },
            { session }
          );
        }

        if (photo && photo.album) {
          await AlbumModel.findByIdAndUpdate(
            { _id: photo.album },
            { $pullAll: { photos: [id] } },
            { session }
          );
        }

        await session.commitTransaction();
      } catch (error) {
        await session.abortTransaction();

        logger.error(error);
        const message = isError(error) ? error.message : '';
        throw new Error(message);
      } finally {
        session.endSession();
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

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        if (photo) {
          const oldAlbum = photo.album;
          const newAlbum = args.album;

          if (oldAlbum?.toString() !== newAlbum?.toString()) {
            if (oldAlbum) {
              await AlbumModel.findByIdAndUpdate(
                { _id: oldAlbum },
                { $pull: { photos: id } },
                { session }
              );
            }
            if (newAlbum) {
              await AlbumModel.findByIdAndUpdate(
                { _id: newAlbum },
                { $push: { photos: id } },
                { session }
              );
            }
          }

          photo.name = args.name ? args.name : '';
          photo.location = args.location ? args.location : '';
          photo.album = args.album ? args.album : null;
          photo.description = args.description ? args.description : '';
          photo.hidden = args.hidden;
          photo.tags = args.tags ? args.tags : [];

          await photo.save({ session });
        }

        await session.commitTransaction();
      } catch (error) {
        await session.abortTransaction();

        logger.error(error);
        const message = isError(error) ? error.message : '';
        throw new Error(message);
      } finally {
        session.endSession();
      }

      return photo;
    },

    editPhotos: async (
      _root: undefined,
      args: EditPhotosArgs,
      context: UserInContext
    ): Promise<Photo[] | null> => {
      const currentUser = context.currentUser;
      const id = args.id;
      if (!id) return null;

      const isOwnPhoto = id.every((value) =>
        currentUser.photos.includes(value)
      );

      if (!currentUser || (!currentUser.isAdmin && !isOwnPhoto)) {
        throw new AuthenticationError('Not authenticated');
      }

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        if (args.album !== undefined) {
          await AlbumModel.updateMany(
            { photos: { $in: id } },
            { $pullAll: { photos: id } },
            { session }
          );

          if (args.album !== null) {
            await AlbumModel.updateMany(
              { _id: args.album },
              { $push: { photos: { $each: id } } },
              { session }
            );
          }
        }

        const fields = { ...args };
        delete fields['id'];

        await PhotoModel.updateMany(
          { _id: { $in: args.id } },
          { $set: fields },
          { session }
        );

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

    editTags: async (
      _root: undefined,
      args: EditTagsArgs,
      context: UserInContext
    ): Promise<Photo[] | null> => {
      const currentUser = context.currentUser;
      const id = args.id;
      if (!id) return null;

      const isOwnPhoto = id.every((value) =>
        currentUser.photos.includes(value)
      );

      if (!currentUser || (!currentUser.isAdmin && !isOwnPhoto)) {
        throw new AuthenticationError('Not authenticated');
      }

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        if (args.deletedTags && args.deletedTags.length > 0) {
          await PhotoModel.updateMany(
            { _id: { $in: id } },
            {
              $pullAll: { tags: args.deletedTags },
            },
            { session }
          );
        }

        if (args.addedTags && args.addedTags.length > 0) {
          await PhotoModel.updateMany(
            { _id: { $in: id } },
            {
              $addToSet: { tags: { $each: args.addedTags } },
            },
            { session }
          );
        }

        await session.commitTransaction();
      } catch (error) {
        await session.abortTransaction();

        logger.error(error);
        const message = isError(error) ? error.message : '';
        throw new Error(message);
      } finally {
        session.endSession();
      }

      const photos = await PhotoModel.find({ _id: { $in: args.id } });
      return photos;
    },
  },
};
