import bcrypt from 'bcrypt';
import UserModel, { User } from '../../models/user';
import PhotoModel, { Photo } from '../../models/photo';
import { initialUsers, initialPhotos } from './initialData';

export const createContextWithUser = (username: string) => {
  return async (): Promise<{ currentUser: User | null }> => {
    const currentUser = await UserModel.findOne({ username });
    return { currentUser };
  };
};

export const photosInDb = async (): Promise<Photo[]> => {
  const photos = await PhotoModel.find({});
  return photos;
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
