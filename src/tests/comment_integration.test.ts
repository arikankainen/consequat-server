import { createTestClient } from 'apollo-server-testing';
import { server, mongoose } from '..';
import Queries from './utils/commentQueries';
import { initialComments, initialComments2 } from './utils/initialData';

import {
  photosInDb,
  usersInDb,
  commentsInDb,
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
  await prepareInitialComments();
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('comment addition', () => {
  it('user can add new comment', async () => {
    const { mutate } = createTestClientWithUser('user');

    const originalComments = await commentsInDb();
    const originalPhotos = await photosInDb();

    const res = await mutate({
      mutation: Queries.CREATE_COMMENT,
      variables: {
        text: 'Comment_test',
        photo: originalPhotos[0].id,
      },
    });

    const updatedComments = await commentsInDb();

    interface CommentData {
      text: string;
      photo: string;
    }

    const emptyCommentData = {
      text: '',
      photo: '',
    };

    const receivedComment: CommentData =
      res.data && res.data.createComment
        ? (res.data.createComment as CommentData)
        : emptyCommentData;

    expect(res.errors).toBe(undefined);
    expect(receivedComment.text).toBe('Comment_test');
    expect(originalComments).toHaveLength(
      initialComments.length + initialComments2.length
    );
    expect(updatedComments).toHaveLength(
      initialComments.length + initialComments2.length + 1
    );
  });
});

describe('comment deletion', () => {
  it('user can delete own comment', async () => {
    const { mutate } = createTestClientWithUser('user');

    const originalComments = await commentsInDb();

    const res = await mutate({
      mutation: Queries.DELETE_COMMENT,
      variables: { id: originalComments[0].id },
    });

    const updatedComments = await commentsInDb();

    expect(res.errors).toBe(undefined);
    expect(originalComments).toHaveLength(
      initialComments.length + initialComments2.length
    );
    expect(updatedComments).toHaveLength(
      initialComments.length + initialComments2.length - 1
    );
  });

  it('user cannot delete other user comment', async () => {
    const { mutate } = createTestClientWithUser('special');

    const originalComments = await commentsInDb();

    const res = await mutate({
      mutation: Queries.DELETE_COMMENT,
      variables: { id: originalComments[0].id },
    });

    const updatedComments = await commentsInDb();

    expect(res.errors).not.toBe(undefined);
    expect(originalComments).toHaveLength(
      initialComments.length + initialComments2.length
    );
    expect(updatedComments).toHaveLength(
      initialComments.length + initialComments2.length
    );
  });

  it('admin can delete any comment', async () => {
    const { mutate } = createTestClientWithUser('admin');

    const originalComments = await commentsInDb();

    const res = await mutate({
      mutation: Queries.DELETE_COMMENT,
      variables: { id: originalComments[0].id },
    });

    const updatedComments = await commentsInDb();

    expect(res.errors).toBe(undefined);
    expect(originalComments).toHaveLength(
      initialComments.length + initialComments2.length
    );
    expect(updatedComments).toHaveLength(
      initialComments.length + initialComments2.length - 1
    );
  });
});

describe('queries', () => {
  it('lists all comments', async () => {
    const { query } = createTestClient(server);
    const res = await query({ query: Queries.LIST_COMMENTS });

    interface CommentData {
      text: string;
    }

    const receivedComments: CommentData[] =
      res.data && res.data.listComments
        ? (res.data.listComments as CommentData[])
        : [];

    for (let i = 0; i < initialComments.length; i++) {
      expect(receivedComments[i].text).toBe(initialComments[i].text);
    }
    expect(res.errors).toBe(undefined);
    expect(receivedComments).toHaveLength(
      initialComments.length + initialComments2.length
    );
  });

  it('lists comments about first photo (10 comments)', async () => {
    const { query } = createTestClient(server);

    const originalPhotos = await photosInDb();

    const res = await query({
      query: Queries.LIST_COMMENTS,
      variables: { photo: originalPhotos[0].id },
    });

    interface CommentData {
      text: string;
    }

    const receivedComments: CommentData[] =
      res.data && res.data.listComments
        ? (res.data.listComments as CommentData[])
        : [];

    for (let i = 0; i < initialComments.length; i++) {
      expect(receivedComments[i].text).toBe(initialComments[i].text);
    }
    expect(res.errors).toBe(undefined);
    expect(receivedComments).toHaveLength(initialComments.length);
  });

  it('lists comments about second photo (zero comments)', async () => {
    const { query } = createTestClient(server);

    const originalPhotos = await photosInDb();

    const res = await query({
      query: Queries.LIST_COMMENTS,
      variables: { photo: originalPhotos[1].id },
    });

    interface CommentData {
      text: string;
    }

    const receivedComments: CommentData[] =
      res.data && res.data.listComments
        ? (res.data.listComments as CommentData[])
        : [];

    expect(res.errors).toBe(undefined);
    expect(receivedComments).toHaveLength(0);
  });

  it('lists comments about fifth photo (5 comments)', async () => {
    const { query } = createTestClient(server);

    const originalPhotos = await photosInDb();

    const res = await query({
      query: Queries.LIST_COMMENTS,
      variables: { photo: originalPhotos[4].id },
    });

    interface CommentData {
      text: string;
    }

    const receivedComments: CommentData[] =
      res.data && res.data.listComments
        ? (res.data.listComments as CommentData[])
        : [];

    for (let i = 0; i < initialComments2.length; i++) {
      expect(receivedComments[i].text).toBe(initialComments2[i].text);
    }
    expect(res.errors).toBe(undefined);
    expect(receivedComments).toHaveLength(initialComments2.length);
  });

  it('lists comments created by Normal User (15 comments)', async () => {
    const { query } = createTestClient(server);

    const originalUsers = await usersInDb();

    const res = await query({
      query: Queries.LIST_COMMENTS,
      variables: { author: originalUsers[1].id },
    });

    interface CommentData {
      text: string;
    }

    const receivedComments: CommentData[] =
      res.data && res.data.listComments
        ? (res.data.listComments as CommentData[])
        : [];

    expect(res.errors).toBe(undefined);
    expect(receivedComments).toHaveLength(
      initialComments.length + initialComments2.length
    );
  });

  it('lists comments created by Special User (zero comments)', async () => {
    const { query } = createTestClient(server);

    const originalUsers = await usersInDb();

    const res = await query({
      query: Queries.LIST_COMMENTS,
      variables: { author: originalUsers[2].id },
    });

    interface CommentData {
      text: string;
    }

    const receivedComments: CommentData[] =
      res.data && res.data.listComments
        ? (res.data.listComments as CommentData[])
        : [];

    expect(res.errors).toBe(undefined);
    expect(receivedComments).toHaveLength(0);
  });
});
