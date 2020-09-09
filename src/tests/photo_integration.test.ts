import { createTestClient } from 'apollo-server-testing';
import { server, mongoose } from '..';
import { photosInDb } from './utils/helpers';
import Queries from './utils/photoQueries';
import { testPhoto } from './utils/testData';
import { initialPhotos } from './utils/initialData';

import {
  createTestClientWithUser,
  prepareInitialUsers,
  prepareInitialPhotos,
} from './utils/helpers';

beforeEach(async () => {
  await prepareInitialUsers();
  await prepareInitialPhotos();
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('photo addition', () => {
  it('user can add new photo', async () => {
    const { mutate } = createTestClientWithUser('user');

    const originalPhotos = await photosInDb();

    const res = await mutate({
      mutation: Queries.ADD_PHOTO,
      variables: testPhoto,
    });

    const updatedPhotos = await photosInDb();

    interface PhotoData {
      filename: string;
      name: string;
    }

    const emptyPhotoData = {
      filename: '',
      name: '',
    };

    const receivedPhoto: PhotoData =
      res.data && res.data.addPhoto ? (res.data.addPhoto as PhotoData) : emptyPhotoData;

    expect(receivedPhoto.filename).toBe(testPhoto.filename);
    expect(receivedPhoto.name).toBe(testPhoto.name);
    expect(originalPhotos).toHaveLength(initialPhotos.length);
    expect(updatedPhotos).toHaveLength(initialPhotos.length + 1);
  });
});

describe('photo deletion', () => {
  it('user can delete own photo', async () => {
    const { mutate } = createTestClientWithUser('user');

    const originalPhotos = await photosInDb();
    const id = originalPhotos[0].id;

    const res = await mutate({
      mutation: Queries.DELETE_PHOTO,
      variables: { id },
    });

    const updatedPhotos = await photosInDb();

    expect(res.errors).toBe(undefined);
    expect(originalPhotos).toHaveLength(initialPhotos.length);
    expect(updatedPhotos).toHaveLength(initialPhotos.length - 1);
  });

  it('user cannot delete other users photo', async () => {
    const { mutate } = createTestClientWithUser('special');

    const originalPhotos = await photosInDb();
    const id = originalPhotos[0].id;

    const res = await mutate({
      mutation: Queries.DELETE_PHOTO,
      variables: { id },
    });
    const updatedPhotos = await photosInDb();

    let error = '';
    if (res.errors) error = res.errors[0].message;

    expect(error).toMatch(/Not authenticated/);
    expect(originalPhotos).toHaveLength(initialPhotos.length);
    expect(updatedPhotos).toHaveLength(initialPhotos.length);
  });

  it('admin can delete any photo', async () => {
    const { mutate } = createTestClientWithUser('admin');

    const originalPhotos = await photosInDb();
    const id = originalPhotos[0].id;

    const res = await mutate({
      mutation: Queries.DELETE_PHOTO,
      variables: { id },
    });

    const updatedPhotos = await photosInDb();

    expect(res.errors).toBe(undefined);
    expect(originalPhotos).toHaveLength(initialPhotos.length);
    expect(updatedPhotos).toHaveLength(initialPhotos.length - 1);
  });
});

describe('photo modification', () => {
  it('user can modify own photo', async () => {
    const { mutate } = createTestClientWithUser('user');

    const originalPhotos = await photosInDb();
    const id = originalPhotos[0].id;

    const modifiedPhoto = {
      id,
      name: 'Updated name',
      location: 'Updated location',
      description: 'Updated description',
      album: null,
    };

    const res = await mutate({
      mutation: Queries.EDIT_PHOTO,
      variables: modifiedPhoto,
    });

    const updatedPhotos = await photosInDb();
    const updatedPhoto = updatedPhotos[0];

    expect(res.errors).toBe(undefined);
    expect(originalPhotos).toHaveLength(initialPhotos.length);
    expect(updatedPhotos).toHaveLength(initialPhotos.length);
    expect(updatedPhoto.name).toBe(modifiedPhoto.name);
  });

  it('user can modify multiple own photos', async () => {
    const { mutate } = createTestClientWithUser('user');

    const originalPhotos = await photosInDb();
    const id = originalPhotos.map((photo) => photo.id);

    const modifiedPhoto = {
      id,
      name: 'Updated name',
    };

    const res = await mutate({
      mutation: Queries.EDIT_PHOTOS,
      variables: modifiedPhoto,
    });

    const updatedPhotos = await photosInDb();

    expect(res.errors).toBe(undefined);
    expect(originalPhotos).toHaveLength(initialPhotos.length);
    expect(updatedPhotos).toHaveLength(initialPhotos.length);

    for (let i = 0; i < initialPhotos.length; i++) {
      expect(updatedPhotos[i].name).toBe(modifiedPhoto.name);
      expect(updatedPhotos[i].location).toBe(initialPhotos[i].location);
      expect(updatedPhotos[i].description).toBe(initialPhotos[i].description);
      expect(updatedPhotos[i].album).toBe(initialPhotos[i].album);
    }
  });

  it('user cannot modify other users photo', async () => {
    const { mutate } = createTestClientWithUser('special');

    const originalPhotos = await photosInDb();
    const id = originalPhotos[0].id;

    const modifiedPhoto = {
      id,
      name: 'Updated name',
      location: 'Updated location',
      description: 'Updated description',
      album: null,
    };

    const res = await mutate({
      mutation: Queries.EDIT_PHOTO,
      variables: modifiedPhoto,
    });

    const updatedPhotos = await photosInDb();
    const updatedPhoto = updatedPhotos[0];

    let error = '';
    if (res.errors) error = res.errors[0].message;

    expect(error).toMatch(/Not authenticated/);
    expect(originalPhotos).toHaveLength(initialPhotos.length);
    expect(updatedPhotos).toHaveLength(initialPhotos.length);
    expect(updatedPhoto.name).not.toBe(modifiedPhoto.name);
  });

  it('admin can modify any photo', async () => {
    const { mutate } = createTestClientWithUser('admin');

    const originalPhotos = await photosInDb();
    const id = originalPhotos[0].id;

    const modifiedPhoto = {
      id,
      name: 'Updated name',
      location: 'Updated location',
      description: 'Updated description',
      album: null,
    };

    const res = await mutate({
      mutation: Queries.EDIT_PHOTO,
      variables: modifiedPhoto,
    });

    const updatedPhotos = await photosInDb();
    const updatedPhoto = updatedPhotos[0];

    expect(res.errors).toBe(undefined);
    expect(originalPhotos).toHaveLength(initialPhotos.length);
    expect(updatedPhotos).toHaveLength(initialPhotos.length);
    expect(updatedPhoto.name).toBe(modifiedPhoto.name);
  });
});

describe('queries', () => {
  it('lists all photos', async () => {
    const { query } = createTestClient(server);
    const res = await query({ query: Queries.LIST_PHOTOS });

    interface PhotoData {
      filename: string;
    }

    const receivedPhotos: PhotoData[] =
      res.data && res.data.listPhotos ? (res.data.listPhotos as PhotoData[]) : [];

    for (let i = 0; i < initialPhotos.length; i++) {
      expect(receivedPhotos[i].filename).toBe(initialPhotos[i].filename);
    }
    expect(receivedPhotos).toHaveLength(initialPhotos.length);
  });
});
