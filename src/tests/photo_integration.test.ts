/* Xeslint-disable */
import { createTestClient } from 'apollo-server-testing';
import { server, mongoose, typeDefs, resolvers, ApolloServer } from '..';
import { createContextWithUser } from './utils/utils';
import { prepareInitialUsers, prepareInitialPhotos } from './utils/utils';
import Queries from './utils/photoQueries';

beforeEach(async () => {
  await prepareInitialUsers();
  await prepareInitialPhotos();
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('photo addition', () => {
  it('new photo can be added', async () => {
    const { mutate } = createTestClient(
      new ApolloServer({
        typeDefs,
        resolvers,
        context: createContextWithUser('user'),
      })
    );

    const photo = {
      mainUrl: 'https://main.url_test',
      thumbUrl: 'https://thumb.url_test',
      filename: 'filename_test.jpg',
      thumbFilename: 'thumbFilename_test.jpg',
      originalFilename: 'originalFilename_test.jpg',
      name: 'Photo name_test',
      location: 'Photo location_test',
      description: 'Photo description_test',
    };

    const res = await mutate({
      mutation: Queries.ADD_PHOTO,
      variables: photo,
    });

    interface PhotoData {
      filename: string;
      name: string;
    }

    const emptyPhotoData = {
      filename: '',
      name: '',
    };

    const photoData: PhotoData =
      res.data && res.data.addPhoto ? (res.data.addPhoto as PhotoData) : emptyPhotoData;
    expect(photoData.filename).toBe('filename_test.jpg');
    expect(photoData.name).toBe('Photo name_test');
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
