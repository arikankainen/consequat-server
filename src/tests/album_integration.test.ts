import { createTestClient } from 'apollo-server-testing';
import { server, mongoose } from '..';
import { albumsInDb } from './utils/helpers';
import Queries from './utils/albumQueries';
import { testAlbum } from './utils/testData';
import { initialAlbums } from './utils/initialData';

import {
  createTestClientWithUser,
  prepareInitialUsers,
  prepareInitialPhotos,
  prepareInitialAlbums,
} from './utils/helpers';

beforeEach(async () => {
  await prepareInitialUsers();
  await prepareInitialPhotos();
  await prepareInitialAlbums();
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('album creation', () => {
  it('user can create new album', async () => {
    const { mutate } = createTestClientWithUser('user');

    const originalAlbums = await albumsInDb();

    const res = await mutate({
      mutation: Queries.CREATE_ALBUM,
      variables: testAlbum,
    });

    const updatedAlbums = await albumsInDb();

    interface AlbumData {
      name: string;
      description: string;
    }

    const emptyAlbumData = {
      name: '',
      description: '',
    };

    const albumData: AlbumData =
      res.data && res.data.createAlbum
        ? (res.data.createAlbum as AlbumData)
        : emptyAlbumData;

    expect(albumData.name).toBe(testAlbum.name);
    expect(albumData.description).toBe(testAlbum.description);
    expect(originalAlbums).toHaveLength(initialAlbums.length);
    expect(updatedAlbums).toHaveLength(initialAlbums.length + 1);
  });
});

describe('album deletion', () => {
  it('user can delete own album', async () => {
    const { mutate } = createTestClientWithUser('user');

    const originalAlbums = await albumsInDb();
    const id = originalAlbums[0].id;

    const res = await mutate({
      mutation: Queries.DELETE_ALBUM,
      variables: { id },
    });

    const updatedAlbums = await albumsInDb();

    expect(res.errors).toBe(undefined);
    expect(originalAlbums).toHaveLength(initialAlbums.length);
    expect(updatedAlbums).toHaveLength(initialAlbums.length - 1);
  });

  it('user cannot delete other users album', async () => {
    const { mutate } = createTestClientWithUser('special');

    const originalAlbums = await albumsInDb();
    const id = originalAlbums[0].id;

    const res = await mutate({
      mutation: Queries.DELETE_ALBUM,
      variables: { id },
    });
    const updatedAlbums = await albumsInDb();

    let error = '';
    if (res.errors) error = res.errors[0].message;

    expect(error).toMatch(/Not authenticated/);
    expect(originalAlbums).toHaveLength(initialAlbums.length);
    expect(updatedAlbums).toHaveLength(initialAlbums.length);
  });

  it('admin can delete any album', async () => {
    const { mutate } = createTestClientWithUser('admin');

    const originalAlbums = await albumsInDb();
    const id = originalAlbums[0].id;

    const res = await mutate({
      mutation: Queries.DELETE_ALBUM,
      variables: { id },
    });

    const updatedAlbums = await albumsInDb();

    expect(res.errors).toBe(undefined);
    expect(originalAlbums).toHaveLength(initialAlbums.length);
    expect(updatedAlbums).toHaveLength(initialAlbums.length - 1);
  });
});

describe('album modification', () => {
  it('user can modify own album', async () => {
    const { mutate } = createTestClientWithUser('user');

    const originalAlbums = await albumsInDb();
    const id = originalAlbums[0].id;

    const modifiedAlbum = {
      id,
      name: 'Updated album',
      description: 'Updated description',
      photos: [],
    };

    const res = await mutate({
      mutation: Queries.EDIT_ALBUM,
      variables: modifiedAlbum,
    });

    const updatedAlbums = await albumsInDb();
    const updatedName = updatedAlbums[0].name;

    expect(res.errors).toBe(undefined);
    expect(originalAlbums).toHaveLength(initialAlbums.length);
    expect(updatedAlbums).toHaveLength(initialAlbums.length);
    expect(updatedName).toBe(modifiedAlbum.name);
  });

  it('user cannot modify other users album', async () => {
    const { mutate } = createTestClientWithUser('special');

    const originalAlbums = await albumsInDb();
    const id = originalAlbums[0].id;

    const modifiedAlbum = {
      id,
      name: 'Updated album',
      description: 'Updated description',
      photos: [],
    };

    const res = await mutate({
      mutation: Queries.EDIT_ALBUM,
      variables: modifiedAlbum,
    });

    const updatedAlbums = await albumsInDb();
    const updatedName = updatedAlbums[0].name;

    let error = '';
    if (res.errors) error = res.errors[0].message;

    expect(error).toMatch(/Not authenticated/);
    expect(originalAlbums).toHaveLength(initialAlbums.length);
    expect(updatedAlbums).toHaveLength(initialAlbums.length);
    expect(updatedName).not.toBe(modifiedAlbum.name);
  });

  it('admin can modify any album', async () => {
    const { mutate } = createTestClientWithUser('admin');

    const originalAlbums = await albumsInDb();
    const id = originalAlbums[0].id;

    const modifiedAlbum = {
      id,
      name: 'Updated album',
      description: 'Updated description',
      photos: [],
    };

    const res = await mutate({
      mutation: Queries.EDIT_ALBUM,
      variables: modifiedAlbum,
    });

    const updatedAlbums = await albumsInDb();
    const updatedName = updatedAlbums[0].name;

    expect(res.errors).toBe(undefined);
    expect(originalAlbums).toHaveLength(initialAlbums.length);
    expect(updatedAlbums).toHaveLength(initialAlbums.length);
    expect(updatedName).toBe(modifiedAlbum.name);
  });
});

describe('queries', () => {
  it('lists all albums', async () => {
    const { query } = createTestClient(server);
    const res = await query({ query: Queries.LIST_ALBUMS });

    interface AlbumData {
      name: string;
    }

    const albumData: AlbumData[] =
      res.data && res.data.listAlbums ? (res.data.listAlbums as AlbumData[]) : [];

    for (let i = 0; i < initialAlbums.length; i++) {
      expect(albumData[i].name).toBe(initialAlbums[i].name);
    }
    expect(albumData).toHaveLength(initialAlbums.length);
  });
});
