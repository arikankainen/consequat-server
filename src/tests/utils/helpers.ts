import bcrypt from 'bcrypt';
import UserModel, { User } from '../../models/user';
import PhotoModel, { Photo } from '../../models/photo';
import AlbumModel, { Album } from '../../models/album';
import CommentModel, { Comment } from '../../models/comment';
import {
  initialUsers,
  initialPhotos,
  initialAlbums,
  initialComments,
  initialComments2,
} from './initialData';
import {
  createTestClient,
  ApolloServerTestClient,
} from 'apollo-server-testing';
import { typeDefs, resolvers, ApolloServer } from '../..';

export const createContextWithUser = (username: string) => {
  return async (): Promise<{ currentUser: User | null }> => {
    const currentUser = await UserModel.findOne({ username });
    return { currentUser };
  };
};

export const createTestClientWithUser = (
  user: string
): ApolloServerTestClient => {
  return createTestClient(
    new ApolloServer({
      typeDefs,
      resolvers,
      context: createContextWithUser(user),
    })
  );
};

export const usersInDb = async (): Promise<User[]> => {
  const users = await UserModel.find({});
  return users;
};

export const photosInDb = async (): Promise<Photo[]> => {
  const photos = await PhotoModel.find({});
  return photos;
};

export const albumsInDb = async (): Promise<Album[]> => {
  const albums = await AlbumModel.find({});
  return albums;
};

export const commentsInDb = async (): Promise<Comment[]> => {
  const comments = await CommentModel.find({});
  return comments;
};

export const photosInAlbum = async (id: string | null): Promise<string[]> => {
  if (!id) return [];
  const album = await AlbumModel.findById(id);
  if (!album) return [];
  return album.photos.map((photo) => String(photo));
};

export const photosInUser = async (
  username: string | null
): Promise<string[]> => {
  if (!username) return [];
  const user = await UserModel.findOne({ username });
  if (!user) return [];
  return user.photos.map((photo) => String(photo));
};

export const albumsInUser = async (
  username: string | null
): Promise<string[]> => {
  if (!username) return [];
  const user = await UserModel.findOne({ username });
  if (!user) return [];
  return user.albums.map((album) => String(album));
};

export const prepareInitialUsers = async (): Promise<void> => {
  await UserModel.deleteMany({});

  const userObjects = await Promise.all(
    initialUsers.map(async (user) => {
      const saltRounds = 10;
      const hash = await bcrypt.hash(user.password, saltRounds);
      user = { ...user, password: hash };
      return new UserModel(user);
    })
  );

  await UserModel.insertMany(userObjects);
};

export const prepareInitialPhotos = async (): Promise<void> => {
  const user = await UserModel.findOne({ username: 'user' });

  if (user) {
    await PhotoModel.deleteMany({});

    const photoObjects = await Promise.all(
      initialPhotos.map((photo) => {
        photo = { ...photo, user: user.id };
        const createdPhoto = new PhotoModel(photo);
        user.photos = user.photos.concat(createdPhoto.id);
        return createdPhoto;
      })
    );

    await user.save();
    await PhotoModel.insertMany(photoObjects);
  }
};

export const prepareInitialAlbums = async (): Promise<void> => {
  const user = await UserModel.findOne({ username: 'user' });

  if (user) {
    await AlbumModel.deleteMany({});

    const albumObjects = await Promise.all(
      initialAlbums.map((album) => {
        album = { ...album, user: user.id };
        const createdAlbum = new AlbumModel(album);
        user.albums = user.albums.concat(createdAlbum.id);
        return createdAlbum;
      })
    );

    await user.save();
    await AlbumModel.insertMany(albumObjects);
  }
};

export const prepareInitialComments = async (): Promise<void> => {
  const user = await UserModel.findOne({ username: 'user' });
  const photo = await PhotoModel.findOne({ name: 'Photo name' });
  const photo2 = await PhotoModel.findOne({ name: 'Photo name5' });

  if (user && photo && photo2) {
    await CommentModel.deleteMany({});

    const commentObjects = await Promise.all(
      initialComments.map((comment) => {
        comment = { ...comment, author: user.id, photo: photo.id };
        const createdComment = new CommentModel(comment);
        return createdComment;
      })
    );

    const commentObjects2 = await Promise.all(
      initialComments2.map((comment) => {
        comment = { ...comment, author: user.id, photo: photo2.id };
        const createdComment = new CommentModel(comment);
        return createdComment;
      })
    );

    await CommentModel.insertMany(commentObjects);
    await CommentModel.insertMany(commentObjects2);
  }
};

export const preparePhotosToAlbums = async (): Promise<void> => {
  const photos = await photosInDb();
  const albums = await albumsInDb();

  albums[0].photos = [photos[0].id, photos[1].id];
  albums[1].photos = [photos[2].id, photos[3].id];
  albums[2].photos = [photos[4].id];

  photos[0].album = albums[0].id;
  photos[1].album = albums[0].id;
  photos[2].album = albums[1].id;
  photos[3].album = albums[1].id;
  photos[4].album = albums[2].id;

  for (let i = 0; i < albums.length; i++) {
    await albums[i].save();
  }

  for (let i = 0; i < photos.length; i++) {
    await photos[i].save();
  }
};
