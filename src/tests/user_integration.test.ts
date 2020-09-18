import { createTestClient } from 'apollo-server-testing';
import { server, mongoose } from '..';
import { createTestClientWithUser } from './utils/helpers';
import Queries from './utils/userQueries';
import { prepareInitialUsers, usersInDb } from './utils/helpers';
import { initialUsers } from './utils/initialData';
import { User } from '../models/user';

beforeEach(async () => {
  await prepareInitialUsers();
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('user creation', () => {
  it('new user with unique username and email can be created', async () => {
    const { mutate } = createTestClient(server);

    const originalUsers = await usersInDb();

    const res = await mutate({
      mutation: Queries.CREATE_USER,
      variables: {
        username: 'testUser',
        password: '12345',
        email: 'test@test.fi',
        fullname: 'Test User',
      },
    });

    const updatedUsers = await usersInDb();

    const createdUserData = {
      createUser: {
        username: 'testUser',
        email: 'test@test.fi',
        fullname: 'Test User',
        isAdmin: false,
      },
    };

    expect(res.errors).toBe(undefined);
    expect(res.data).toEqual(createdUserData);
    expect(originalUsers).toHaveLength(initialUsers.length);
    expect(updatedUsers).toHaveLength(initialUsers.length + 1);
  });

  it('new user with existing username cannot be created', async () => {
    const { mutate } = createTestClient(server);

    const originalUsers = await usersInDb();

    const res = await mutate({
      mutation: Queries.CREATE_USER,
      variables: {
        username: 'user',
        password: '12345',
        email: 'test@test.fi',
        fullname: 'Test User',
      },
    });

    const updatedUsers = await usersInDb();

    let error = '';
    if (res.errors) error = res.errors[0].message;

    expect(error).toMatch(/expected `username` to be unique/);
    expect(res.data).toEqual({ createUser: null });
    expect(originalUsers).toHaveLength(initialUsers.length);
    expect(updatedUsers).toHaveLength(initialUsers.length);
  });

  it('new user with existing email cannot be created', async () => {
    const { mutate } = createTestClient(server);

    const originalUsers = await usersInDb();

    const res = await mutate({
      mutation: Queries.CREATE_USER,
      variables: {
        username: 'testUser',
        password: '12345',
        email: 'user@test.fi',
        fullname: 'Test User',
      },
    });

    const updatedUsers = await usersInDb();

    let error = '';
    if (res.errors) error = res.errors[0].message;

    expect(error).toMatch(/expected `email` to be unique/);
    expect(res.data).toEqual({ createUser: null });
    expect(originalUsers).toHaveLength(initialUsers.length);
    expect(updatedUsers).toHaveLength(initialUsers.length);
  });

  it('new user with too short username cannot be created', async () => {
    const { mutate } = createTestClient(server);

    const originalUsers = await usersInDb();

    const res = await mutate({
      mutation: Queries.CREATE_USER,
      variables: {
        username: 'ab',
        password: '12345',
        email: 'test@test.fi',
        fullname: 'Short username',
      },
    });

    const updatedUsers = await usersInDb();

    let error = '';
    if (res.errors) error = res.errors[0].message;

    expect(error).toMatch(/username must be at least 3 characters/);
    expect(res.data).toEqual({ createUser: null });
    expect(originalUsers).toHaveLength(initialUsers.length);
    expect(updatedUsers).toHaveLength(initialUsers.length);
  });

  it('new user with too short password cannot be created', async () => {
    const { mutate } = createTestClient(server);

    const originalUsers = await usersInDb();

    const res = await mutate({
      mutation: Queries.CREATE_USER,
      variables: {
        username: 'testUser',
        password: '1234',
        email: 'test@test.fi',
        fullname: 'Test User',
      },
    });

    const updatedUsers = await usersInDb();

    let error = '';
    if (res.errors) error = res.errors[0].message;

    expect(error).toMatch(/password must be at least 5 characters/);
    expect(res.data).toEqual({ createUser: null });
    expect(originalUsers).toHaveLength(initialUsers.length);
    expect(updatedUsers).toHaveLength(initialUsers.length);
  });

  it('new user with empty fullname cannot be created', async () => {
    const { mutate } = createTestClient(server);

    const originalUsers = await usersInDb();

    const res = await mutate({
      mutation: Queries.CREATE_USER,
      variables: {
        username: 'testUser',
        password: '12345',
        email: 'test@test.fi',
        fullname: '',
      },
    });

    const updatedUsers = await usersInDb();

    let error = '';
    if (res.errors) error = res.errors[0].message;

    expect(error).toMatch(/full name required/);
    expect(res.data).toEqual({ createUser: null });
    expect(originalUsers).toHaveLength(initialUsers.length);
    expect(updatedUsers).toHaveLength(initialUsers.length);
  });

  it('new user with missing fullname cannot be created', async () => {
    const { mutate } = createTestClient(server);

    const originalUsers = await usersInDb();

    const res = await mutate({
      mutation: Queries.CREATE_USER,
      variables: {
        username: 'testUser',
        password: '12345',
        email: 'test@test.fi',
      },
    });

    const updatedUsers = await usersInDb();

    let error = '';
    if (res.errors) error = res.errors[0].message;

    expect(error).toMatch(
      /Variable "\$fullname" of required type "String!" was not provided/
    );
    expect(res.data).not.toBeDefined();
    expect(originalUsers).toHaveLength(initialUsers.length);
    expect(updatedUsers).toHaveLength(initialUsers.length);
  });

  it('new user with malformatted email cannot be created', async () => {
    const { mutate } = createTestClient(server);

    const originalUsers = await usersInDb();

    const res = await mutate({
      mutation: Queries.CREATE_USER,
      variables: {
        username: 'testUser',
        password: '12345',
        email: 'notrealemail',
        fullname: 'Test User',
      },
    });

    const updatedUsers = await usersInDb();

    let error = '';
    if (res.errors) error = res.errors[0].message;

    expect(error).toMatch(/email must be valid e-mail/);
    expect(res.data).toEqual({ createUser: null });
    expect(originalUsers).toHaveLength(initialUsers.length);
    expect(updatedUsers).toHaveLength(initialUsers.length);
  });

  it('new user with empty email cannot be created', async () => {
    const { mutate } = createTestClient(server);

    const originalUsers = await usersInDb();

    const res = await mutate({
      mutation: Queries.CREATE_USER,
      variables: {
        username: 'testUser',
        password: '12345',
        email: '',
        fullname: 'Test User',
      },
    });

    const updatedUsers = await usersInDb();

    let error = '';
    if (res.errors) error = res.errors[0].message;

    expect(error).toMatch(/email required/);
    expect(res.data).toEqual({ createUser: null });
    expect(originalUsers).toHaveLength(initialUsers.length);
    expect(updatedUsers).toHaveLength(initialUsers.length);
  });

  it('new user with missing email cannot be created', async () => {
    const { mutate } = createTestClient(server);

    const originalUsers = await usersInDb();

    const res = await mutate({
      mutation: Queries.CREATE_USER,
      variables: {
        username: 'testUser',
        password: '12345',
        fullname: 'Test User',
      },
    });

    const updatedUsers = await usersInDb();

    let error = '';
    if (res.errors) error = res.errors[0].message;

    expect(error).toMatch(
      /Variable "\$email" of required type "String!" was not provided/
    );
    expect(res.data).not.toBeDefined();
    expect(originalUsers).toHaveLength(initialUsers.length);
    expect(updatedUsers).toHaveLength(initialUsers.length);
  });
});

describe('login', () => {
  it('user with correct credentials can login and receives token', async () => {
    const { mutate } = createTestClient(server);

    const res = await mutate({
      mutation: Queries.LOGIN,
      variables: {
        username: 'admin',
        password: '12345',
      },
    });

    interface LoginData {
      token: string;
    }

    const loginData =
      res.data && res.data.login
        ? (res.data.login as LoginData)
        : { token: '' };
    expect(loginData.token).toHaveLength(173);
  });

  it('user with incorrect credentials cannot login and receives empty token', async () => {
    const { mutate } = createTestClient(server);

    const res = await mutate({
      mutation: Queries.LOGIN,
      variables: {
        username: 'admin',
        password: 'wrong',
      },
    });

    interface LoginData {
      token: string;
    }

    const loginData =
      res.data && res.data.login
        ? (res.data.login as LoginData)
        : { token: '' };
    expect(loginData.token).toHaveLength(0);
  });
});

describe('user modify', () => {
  it('user can modify own email', async () => {
    const { mutate, query } = createTestClientWithUser('user');

    const queryRes = await query({ query: Queries.ME });
    const queriedUser =
      queryRes.data && queryRes.data.me
        ? (queryRes.data.me as User)
        : undefined;

    if (!queriedUser || !queriedUser.id) throw new Error('user not found');

    const mutateRes = await mutate({
      mutation: Queries.EDIT_USER,
      variables: {
        id: queriedUser.id,
        email: 'new@mail.com',
      },
    });
    const mutatedUser =
      mutateRes.data && mutateRes.data.editUser
        ? (mutateRes.data.editUser as User)
        : undefined;

    const updatedUsers = await usersInDb();
    const updatedUser = updatedUsers[1];

    expect(mutatedUser).toBeDefined();
    expect(queryRes.errors).toBe(undefined);
    expect(mutateRes.errors).toBe(undefined);
    expect(updatedUser.email).toBe('new@mail.com');
  });

  it('user can modify own password if old password is correct', async () => {
    const { mutate, query } = createTestClientWithUser('user');

    const queryRes = await query({ query: Queries.ME });
    const queriedUser =
      queryRes.data && queryRes.data.me
        ? (queryRes.data.me as User)
        : undefined;

    if (!queriedUser || !queriedUser.id) throw new Error('user not found');

    const mutateRes = await mutate({
      mutation: Queries.EDIT_USER,
      variables: {
        id: queriedUser.id,
        oldPassword: '00000',
        newPassword: '11111',
      },
    });
    const mutatedUser =
      mutateRes.data && mutateRes.data.editUser
        ? (mutateRes.data.editUser as User)
        : undefined;

    expect(mutatedUser).toBeDefined();
    expect(queryRes.errors).toBe(undefined);
    expect(mutateRes.errors).toBe(undefined);
  });

  it('user cannot modify own password if old password is incorrect', async () => {
    const { mutate, query } = createTestClientWithUser('user');

    const queryRes = await query({ query: Queries.ME });
    const queriedUser =
      queryRes.data && queryRes.data.me
        ? (queryRes.data.me as User)
        : undefined;

    if (!queriedUser || !queriedUser.id) throw new Error('user not found');

    const mutateRes = await mutate({
      mutation: Queries.EDIT_USER,
      variables: {
        id: queriedUser.id,
        oldPassword: '00001',
        newPassword: '11111',
      },
    });
    const mutatedUser =
      mutateRes.data && mutateRes.data.editUser
        ? (mutateRes.data.editUser as User)
        : undefined;

    expect(mutatedUser).toBe(undefined);
    expect(queryRes.errors).toBe(undefined);
    expect(mutateRes.errors).toBeDefined();
  });
});

describe('user deletion', () => {
  it('user can delete own account', async () => {
    const { mutate } = createTestClientWithUser('user');

    const originalUsers = await usersInDb();

    const res = await mutate({
      mutation: Queries.DELETE_USER,
      variables: {
        username: 'user',
      },
    });

    const updatedUsers = await usersInDb();

    interface UserData {
      username: string;
      fullname: string;
    }

    const userData =
      res.data && res.data.deleteUser
        ? (res.data.deleteUser as UserData)
        : { username: '', fullname: '' };
    expect(userData.fullname).toBe('Normal User');
    expect(originalUsers).toHaveLength(initialUsers.length);
    expect(updatedUsers).toHaveLength(initialUsers.length - 1);
  });

  it('user cannot delete other account', async () => {
    const { mutate } = createTestClientWithUser('special');

    const originalUsers = await usersInDb();

    const res = await mutate({
      mutation: Queries.DELETE_USER,
      variables: {
        username: 'user',
      },
    });

    const updatedUsers = await usersInDb();

    interface UserData {
      username: string;
      fullname: string;
    }

    const userData =
      res.data && res.data.deleteUser
        ? (res.data.deleteUser as UserData)
        : { username: '', fullname: '' };
    expect(userData.fullname).not.toBe('Normal User');
    expect(originalUsers).toHaveLength(initialUsers.length);
    expect(updatedUsers).toHaveLength(initialUsers.length);
  });

  it('admin can delete any account', async () => {
    const { mutate } = createTestClientWithUser('admin');

    const originalUsers = await usersInDb();

    const res = await mutate({
      mutation: Queries.DELETE_USER,
      variables: {
        username: 'user',
      },
    });

    const updatedUsers = await usersInDb();

    interface UserData {
      username: string;
      fullname: string;
    }

    const userData =
      res.data && res.data.deleteUser
        ? (res.data.deleteUser as UserData)
        : { username: '', fullname: '' };
    expect(userData.fullname).toBe('Normal User');
    expect(originalUsers).toHaveLength(initialUsers.length);
    expect(updatedUsers).toHaveLength(initialUsers.length - 1);
  });
});

describe('own info', () => {
  it('user can query own information', async () => {
    const { query } = createTestClientWithUser('user');

    const res = await query({ query: Queries.ME });

    interface UserData {
      fullname: string;
      id: string;
    }

    const userData =
      res.data && res.data.me
        ? (res.data.me as UserData)
        : { fullname: '', id: '' };
    expect(userData.fullname).toBe('Normal User');
  });
});

describe('queries', () => {
  it('lists all users', async () => {
    const { query } = createTestClient(server);
    const res = await query({ query: Queries.LIST_USERS });

    interface UserData {
      username: string;
      email: string;
      fullname: string;
      isAdmin: boolean;
    }

    const usersData =
      res.data && res.data.listUsers ? (res.data.listUsers as UserData[]) : [];
    expect(usersData).toHaveLength(initialUsers.length);
  });

  it('finds user by username', async () => {
    const { query } = createTestClient(server);
    const res = await query({
      query: Queries.GET_USER,
      variables: { username: 'admin' },
    });

    interface UserData {
      id: string;
      fullname: string;
    }

    const userData =
      res.data && res.data.getUser
        ? (res.data.getUser as UserData)
        : { id: '', fullname: '' };
    expect(userData.id).toHaveLength(24);
    expect(userData.fullname).toBe('Administrator');
  });
});
