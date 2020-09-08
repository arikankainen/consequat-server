import { createTestClient } from 'apollo-server-testing';
import { server, mongoose, typeDefs, resolvers, ApolloServer } from '..';
import { createContextWithUser, photosInDb } from './utils/helpers';
import { prepareInitialUsers, prepareInitialPhotos } from './utils/helpers';
import Queries from './utils/photoQueries';
import { testPhoto } from './utils/testData';
import { initialPhotos } from './utils/initialData';

beforeEach(async () => {
  await prepareInitialUsers();
  await prepareInitialPhotos();
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('photo addition', () => {
  it('user can add new photo', async () => {
    const { mutate } = createTestClient(
      new ApolloServer({
        typeDefs,
        resolvers,
        context: createContextWithUser('user'),
      })
    );

    interface PhotoData {
      filename: string;
      name: string;
    }

    const emptyPhotoData = {
      filename: '',
      name: '',
    };

    const originalPhotos = await photosInDb();

    const res = await mutate({
      mutation: Queries.ADD_PHOTO,
      variables: testPhoto,
    });

    const updatedPhotos = await photosInDb();

    const photoData: PhotoData =
      res.data && res.data.addPhoto ? (res.data.addPhoto as PhotoData) : emptyPhotoData;

    expect(photoData.filename).toBe('filename_test.jpg');
    expect(photoData.name).toBe('Photo name_test');
    expect(originalPhotos).toHaveLength(5);
    expect(updatedPhotos).toHaveLength(6);
  });
});

describe('photo deletion', () => {
  it('user can delete own photo', async () => {
    const { mutate } = createTestClient(
      new ApolloServer({
        typeDefs,
        resolvers,
        context: createContextWithUser('user'),
      })
    );

    const originalPhotos = await photosInDb();
    const id = originalPhotos[0].id;

    const res = await mutate({
      mutation: Queries.DELETE_PHOTO,
      variables: { id },
    });

    const updatedPhotos = await photosInDb();

    expect(res.errors).toBe(undefined);
    expect(originalPhotos).toHaveLength(5);
    expect(updatedPhotos).toHaveLength(4);
  });

  it('user cannot delete other users photo', async () => {
    const { mutate } = createTestClient(
      new ApolloServer({
        typeDefs,
        resolvers,
        context: createContextWithUser('special'),
      })
    );

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
    expect(originalPhotos).toHaveLength(5);
    expect(updatedPhotos).toHaveLength(5);
  });

  it('admin can delete any photo', async () => {
    const { mutate } = createTestClient(
      new ApolloServer({
        typeDefs,
        resolvers,
        context: createContextWithUser('admin'),
      })
    );

    const originalPhotos = await photosInDb();
    const id = originalPhotos[0].id;

    const res = await mutate({
      mutation: Queries.DELETE_PHOTO,
      variables: { id },
    });

    const updatedPhotos = await photosInDb();

    expect(res.errors).toBe(undefined);
    expect(originalPhotos).toHaveLength(5);
    expect(updatedPhotos).toHaveLength(4);
  });
});

describe('photo modification', () => {
  it('user can modify own photo', async () => {
    const { mutate } = createTestClient(
      new ApolloServer({
        typeDefs,
        resolvers,
        context: createContextWithUser('user'),
      })
    );

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
    const updatedName = updatedPhotos[0].name;

    expect(res.errors).toBe(undefined);
    expect(originalPhotos).toHaveLength(5);
    expect(updatedPhotos).toHaveLength(5);
    expect(updatedName).toBe('Updated name');
  });

  it('user can modify multiple own photos', async () => {
    const { mutate } = createTestClient(
      new ApolloServer({
        typeDefs,
        resolvers,
        context: createContextWithUser('user'),
      })
    );

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
    expect(originalPhotos).toHaveLength(5);
    expect(updatedPhotos).toHaveLength(5);

    for (let i = 0; i < 5; i++) {
      expect(updatedPhotos[i].name).toBe('Updated name');
      expect(updatedPhotos[i].location).toBe(initialPhotos[i].location);
      expect(updatedPhotos[i].description).toBe(initialPhotos[i].description);
      expect(updatedPhotos[i].album).toBe(initialPhotos[i].album);
    }
  });

  it('user cannot modify other users photo', async () => {
    const { mutate } = createTestClient(
      new ApolloServer({
        typeDefs,
        resolvers,
        context: createContextWithUser('special'),
      })
    );

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
    const updatedName = updatedPhotos[0].name;

    let error = '';
    if (res.errors) error = res.errors[0].message;

    expect(error).toMatch(/Not authenticated/);
    expect(originalPhotos).toHaveLength(5);
    expect(updatedPhotos).toHaveLength(5);
    expect(updatedName).not.toBe('Updated name');
  });
});

describe('queries', () => {
  it('lists all photos', async () => {
    const { query } = createTestClient(server);
    const res = await query({ query: Queries.LIST_PHOTOS });

    interface PhotoData {
      filename: string;
    }

    const photosData: PhotoData[] =
      res.data && res.data.listPhotos ? (res.data.listPhotos as PhotoData[]) : [];

    expect(photosData).toHaveLength(5);
    expect(photosData[0].filename).toBe('filename.jpg');
    expect(photosData[1].filename).toBe('filename2.jpg');
    expect(photosData[2].filename).toBe('filename3.jpg');
    expect(photosData[3].filename).toBe('filename4.jpg');
    expect(photosData[4].filename).toBe('filename5.jpg');
  });
});
