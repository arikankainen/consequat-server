import { createTestClient } from 'apollo-server-testing';
import { server, mongoose } from '..';
import Queries from './utils/photoQueries';
import { testPhoto } from './utils/testData';
import {
  initialComments,
  initialComments2,
  initialPhotos,
} from './utils/initialData';

import {
  photosInDb,
  commentsInDb,
  prepareInitialAlbums,
  preparePhotosToAlbums,
  photosInAlbum,
  albumsInDb,
  photosInUser,
  prepareInitialComments,
} from './utils/helpers';

import {
  createTestClientWithUser,
  prepareInitialUsers,
  prepareInitialPhotos,
} from './utils/helpers';

beforeEach(async () => {
  await prepareInitialUsers();
  await prepareInitialPhotos();
  await prepareInitialAlbums();
  await prepareInitialComments();
  await preparePhotosToAlbums();
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('photo addition', () => {
  it('user can add new photo', async () => {
    const { mutate } = createTestClientWithUser('user');

    const originalPhotos = await photosInDb();
    const originalPhotosInUser = await photosInUser('user');

    const res = await mutate({
      mutation: Queries.ADD_PHOTO,
      variables: testPhoto,
    });

    const updatedPhotos = await photosInDb();
    const updatedPhotosInUser = await photosInUser('user');

    interface PhotoData {
      filename: string;
      name: string;
    }

    const emptyPhotoData = {
      filename: '',
      name: '',
    };
    const receivedPhoto: PhotoData =
      res.data && res.data.addPhoto
        ? (res.data.addPhoto as PhotoData)
        : emptyPhotoData;

    expect(receivedPhoto.filename).toBe(testPhoto.filename);
    expect(receivedPhoto.name).toBe(testPhoto.name);
    expect(originalPhotos).toHaveLength(initialPhotos.length);
    expect(updatedPhotos).toHaveLength(initialPhotos.length + 1);
    expect(updatedPhotosInUser).toHaveLength(originalPhotosInUser.length + 1);
  });
});

describe('photo deletion', () => {
  it('user can delete own photo', async () => {
    const { mutate } = createTestClientWithUser('user');

    const originalPhotos = await photosInDb();
    const originalComments = await commentsInDb();
    const originalPhotosInUser = await photosInUser('user');

    const photoToDelete = originalPhotos[0];
    const photoId = photoToDelete.id;
    const albumId = photoToDelete.album;

    const originalPhotosInAlbum = await photosInAlbum(albumId);

    const res = await mutate({
      mutation: Queries.DELETE_PHOTO,
      variables: { id: photoId },
    });

    const updatedPhotosInUser = await photosInUser('user');
    const updatedPhotos = await photosInDb();
    const updatedComments = await commentsInDb();
    const updatedPhotosInAlbum = await photosInAlbum(albumId);

    expect(res.errors).toBe(undefined);
    expect(originalPhotos).toHaveLength(initialPhotos.length);
    expect(updatedPhotos).toHaveLength(initialPhotos.length - 1);

    expect(originalPhotosInAlbum).toContain(photoId);
    expect(updatedPhotosInAlbum).not.toContain(photoId);
    expect(updatedPhotosInAlbum).toHaveLength(originalPhotosInAlbum.length - 1);
    expect(updatedPhotosInUser).toHaveLength(originalPhotosInUser.length - 1);

    expect(originalComments).toHaveLength(
      initialComments.length + initialComments2.length
    );
    expect(updatedComments).toHaveLength(initialComments2.length);
  });

  it('user cannot delete other users photo', async () => {
    const { mutate } = createTestClientWithUser('special');

    const originalPhotos = await photosInDb();
    const photoToDelete = originalPhotos[0];
    const photoId = photoToDelete.id;

    const res = await mutate({
      mutation: Queries.DELETE_PHOTO,
      variables: { id: photoId },
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
    const originalPhotosInUser = await photosInUser('user');

    const photoToDelete = originalPhotos[0];
    const photoId = photoToDelete.id;
    const albumId = photoToDelete.album;

    const originalPhotosInAlbum = await photosInAlbum(albumId);

    const res = await mutate({
      mutation: Queries.DELETE_PHOTO,
      variables: { id: photoId },
    });

    const updatedPhotosInUser = await photosInUser('user');
    const updatedPhotos = await photosInDb();
    const updatedPhotosInAlbum = await photosInAlbum(albumId);

    expect(res.errors).toBe(undefined);
    expect(originalPhotos).toHaveLength(initialPhotos.length);
    expect(updatedPhotos).toHaveLength(initialPhotos.length - 1);

    expect(originalPhotosInAlbum).toContain(photoId);
    expect(updatedPhotosInAlbum).not.toContain(photoId);
    expect(updatedPhotosInAlbum).toHaveLength(originalPhotosInAlbum.length - 1);
    expect(updatedPhotosInUser).toHaveLength(originalPhotosInUser.length - 1);
  });
});

describe('photo modification', () => {
  it('user can modify own photo', async () => {
    const { mutate } = createTestClientWithUser('user');

    const originalPhotos = await photosInDb();
    const originalAlbums = await albumsInDb();

    const photoId = originalPhotos[0].id;
    const oldAlbumId = originalPhotos[0].album;
    const newAlbumId = originalAlbums[2].id;

    const modifiedPhoto = {
      id: photoId,
      name: 'Updated name',
      location: 'Updated location',
      description: 'Updated description',
      tags: ['updated', 'another_updated', 'yet_another'],
      album: newAlbumId,
    };

    const res = await mutate({
      mutation: Queries.EDIT_PHOTO,
      variables: modifiedPhoto,
    });

    const updatedPhotos = await photosInDb();
    const updatedPhotosInOldAlbum = await photosInAlbum(oldAlbumId);
    const updatedPhotosInNewAlbum = await photosInAlbum(newAlbumId);

    const updatedPhoto = updatedPhotos[0];

    expect(res.errors).toBe(undefined);

    expect(originalPhotos).toHaveLength(initialPhotos.length);
    expect(updatedPhotos).toHaveLength(initialPhotos.length);

    expect(updatedPhoto.name).toBe(modifiedPhoto.name);
    expect(Array.from(updatedPhoto.tags)).toEqual(modifiedPhoto.tags);
    expect(updatedPhoto.location).toBe(modifiedPhoto.location);
    expect(updatedPhoto.description).toBe(modifiedPhoto.description);
    expect(String(updatedPhoto.album)).toBe(modifiedPhoto.album);

    expect(updatedPhotosInOldAlbum).not.toContain(photoId);
    expect(updatedPhotosInNewAlbum).toContain(photoId);
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
      expect(Array.from(updatedPhotos[i].tags)).toEqual(initialPhotos[i].tags);
    }
  });

  it('user can modify and move multiple own photos to new album', async () => {
    const { mutate } = createTestClientWithUser('user');

    const originalPhotos = await photosInDb();
    const originalAlbums = await albumsInDb();
    const photoIds = originalPhotos.map((photo) => photo.id);
    const newAlbumId = originalAlbums[2].id;

    const modifiedPhoto = {
      id: photoIds,
      name: 'Updated name',
      album: newAlbumId,
    };

    const res = await mutate({
      mutation: Queries.EDIT_PHOTOS,
      variables: modifiedPhoto,
    });

    const updatedPhotos = await photosInDb();
    const updatedAlbums = await albumsInDb();

    expect(res.errors).toBe(undefined);
    expect(originalPhotos).toHaveLength(initialPhotos.length);
    expect(updatedPhotos).toHaveLength(initialPhotos.length);

    for (let i = 0; i < initialPhotos.length; i++) {
      expect(updatedPhotos[i].name).toBe(modifiedPhoto.name);
      expect(updatedPhotos[i].location).toBe(initialPhotos[i].location);
      expect(updatedPhotos[i].description).toBe(initialPhotos[i].description);
      expect(String(updatedPhotos[i].album)).toBe(modifiedPhoto.album);
    }

    expect(updatedAlbums[0].photos).toHaveLength(0);
    expect(updatedAlbums[1].photos).toHaveLength(0);
    expect(updatedAlbums[2].photos).toHaveLength(initialPhotos.length);
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
    const originalAlbums = await albumsInDb();

    const photoId = originalPhotos[0].id;
    const oldAlbumId = originalPhotos[0].album;
    const newAlbumId = originalAlbums[2].id;

    const modifiedPhoto = {
      id: photoId,
      name: 'Updated name',
      location: 'Updated location',
      description: 'Updated description',
      album: newAlbumId,
    };

    const res = await mutate({
      mutation: Queries.EDIT_PHOTO,
      variables: modifiedPhoto,
    });

    const updatedPhotos = await photosInDb();
    const updatedPhotosInOldAlbum = await photosInAlbum(oldAlbumId);
    const updatedPhotosInNewAlbum = await photosInAlbum(newAlbumId);

    const updatedPhoto = updatedPhotos[0];

    expect(res.errors).toBe(undefined);

    expect(originalPhotos).toHaveLength(initialPhotos.length);
    expect(updatedPhotos).toHaveLength(initialPhotos.length);

    expect(updatedPhoto.name).toBe(modifiedPhoto.name);
    expect(updatedPhoto.location).toBe(modifiedPhoto.location);
    expect(updatedPhoto.description).toBe(modifiedPhoto.description);
    expect(String(updatedPhoto.album)).toBe(modifiedPhoto.album);

    expect(updatedPhotosInOldAlbum).not.toContain(photoId);
    expect(updatedPhotosInNewAlbum).toContain(photoId);
  });
});

describe('queries', () => {
  it('lists all photos', async () => {
    const { query } = createTestClient(server);
    const res = await query({ query: Queries.LIST_PHOTOS });

    interface PhotoData {
      totalCount: number;
      photos: [{ filename: string }];
    }

    const emptyPhotoData: PhotoData = {
      totalCount: 0,
      photos: [{ filename: '' }],
    };

    const receivedPhotos: PhotoData =
      res.data && res.data.listPhotos
        ? (res.data.listPhotos as PhotoData)
        : emptyPhotoData;

    const nonHiddenPhotos = initialPhotos.filter(
      (photo) => photo.hidden === false
    );
    const hiddenPhotos = initialPhotos.filter((photo) => photo.hidden === true);

    expect(receivedPhotos.totalCount).toBe(4);

    for (let i = 0; i < nonHiddenPhotos.length; i++) {
      expect(receivedPhotos.photos[i].filename).toBe(
        nonHiddenPhotos[i].filename
      );
      expect(receivedPhotos.photos[i].filename).not.toBe(
        hiddenPhotos[0].filename
      );
    }
    expect(receivedPhotos.photos).toHaveLength(nonHiddenPhotos.length);
  });

  it('get info about non-hidden photo', async () => {
    const { query } = createTestClient(server);

    const originalPhotos = await photosInDb();

    const res = await query({
      query: Queries.GET_PHOTO,
      variables: { id: originalPhotos[0].id },
    });

    interface PhotoData {
      filename: string;
    }

    const receivedPhoto: PhotoData =
      res.data && res.data.getPhoto
        ? (res.data.getPhoto as PhotoData)
        : { filename: '' };

    expect(res.errors).toBe(undefined);
    expect(receivedPhoto.filename).toBe(initialPhotos[0].filename);
  });

  it('cannot get info about hidden photo', async () => {
    const { query } = createTestClient(server);

    const originalPhotos = await photosInDb();

    const res = await query({
      query: Queries.GET_PHOTO,
      variables: { id: originalPhotos[4].id },
    });

    interface PhotoData {
      filename: string;
    }

    const receivedPhoto: PhotoData =
      res.data && res.data.getPhoto
        ? (res.data.getPhoto as PhotoData)
        : { filename: '' };

    expect(res.errors).toBe(undefined);
    expect(receivedPhoto.filename).toBe('');
  });
});

describe('editing tags', () => {
  it('user can modify add and delete tags on multiple photos', async () => {
    const { mutate } = createTestClientWithUser('user');

    const originalPhotos = await photosInDb();
    const id = originalPhotos.map((photo) => photo.id);

    const modifiedPhoto = {
      id,
      addedTags: ['testTag1', 'testTag2', 'testTag3'],
      deletedTags: ['animals', 'landscape'],
    };

    const res = await mutate({
      mutation: Queries.EDIT_TAGS,
      variables: modifiedPhoto,
    });

    const updatedPhotos = await photosInDb();

    expect(res.errors).toBe(undefined);
    expect(originalPhotos).toHaveLength(initialPhotos.length);
    expect(updatedPhotos).toHaveLength(initialPhotos.length);

    for (let i = 0; i < initialPhotos.length; i++) {
      expect(Array.from(updatedPhotos[i].tags)).toContain('testTag1');
      expect(Array.from(updatedPhotos[i].tags)).toContain('testTag2');
      expect(Array.from(updatedPhotos[i].tags)).toContain('testTag3');
      expect(Array.from(updatedPhotos[i].tags)).not.toContain('animals');
      expect(Array.from(updatedPhotos[i].tags)).not.toContain('landscape');
    }

    expect(Array.from(updatedPhotos[1].tags)).toContain('night');
    expect(Array.from(updatedPhotos[1].tags)).toContain('forrest');
    expect(Array.from(updatedPhotos[2].tags)).toContain('cat');
    expect(Array.from(updatedPhotos[3].tags)).toContain('portrait');
    expect(Array.from(updatedPhotos[3].tags)).toContain('photomodel');
  });
});
