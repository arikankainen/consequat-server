import bcrypt from 'bcrypt';
import UserModel, { User } from '../../models/user';
import PhotoModel, { Photo } from '../../models/photo';
import AlbumModel, { Album } from '../../models/album';
import { initialUsers, initialPhotos, initialAlbums } from './initialData';
import { createTestClient, ApolloServerTestClient } from 'apollo-server-testing';
import { typeDefs, resolvers, ApolloServer } from '../..';

export const createContextWithUser = (username: string) => {
  return async (): Promise<{ currentUser: User | null }> => {
    const currentUser = await UserModel.findOne({ username });
    return { currentUser };
  };
};

export const createTestClientWithUser = (user: string): ApolloServerTestClient => {
  return createTestClient(
    new ApolloServer({
      typeDefs,
      resolvers,
      context: createContextWithUser(user),
    })
  );
};

export const photosInDb = async (): Promise<Photo[]> => {
  const photos = await PhotoModel.find({});
  return photos;
};

export const albumsInDb = async (): Promise<Album[]> => {
  const albums = await AlbumModel.find({});
  return albums;
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
        user.albums = user.albums.concat(createdPhoto.id);
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
