import { createTestClient } from 'apollo-server-testing';
import bcrypt from 'bcrypt';
import { server, mongoose, typeDefs, resolvers, ApolloServer } from '..';
import UserModel from '../models/user';
import { createContextWithUser } from './utils/utils';
import { initialUsers } from './utils/initialData';
import Queries from './utils/userQueries';

beforeEach(async () => {
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
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('user creation', () => {
  it('new user with unique username and email can be created', async () => {
    const { mutate } = createTestClient(server);

    const res = await mutate({
      mutation: Queries.CREATE_USER,
      variables: {
        username: 'testUser',
        password: '12345',
        email: 'test@test.fi',
        fullname: 'Test User',
      },
    });

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
  });

  it('new user with existing username cannot be created', async () => {
    const { mutate } = createTestClient(server);

    const res = await mutate({
      mutation: Queries.CREATE_USER,
      variables: {
        username: 'user',
        password: '12345',
        email: 'test@test.fi',
        fullname: 'Test User',
      },
    });

    let error = '';
    if (res.errors) error = res.errors[0].message;

    expect(error).toMatch(/expected `username` to be unique/);
    expect(res.data).toEqual({ createUser: null });
  });

  it('new user with existing email cannot be created', async () => {
    const { mutate } = createTestClient(server);

    const res = await mutate({
      mutation: Queries.CREATE_USER,
      variables: {
        username: 'testUser',
        password: '12345',
        email: 'user@test.fi',
        fullname: 'Test User',
      },
    });

    let error = '';
    if (res.errors) error = res.errors[0].message;

    expect(error).toMatch(/expected `email` to be unique/);
    expect(res.data).toEqual({ createUser: null });
  });

  it('new user with too short username cannot be created', async () => {
    const { mutate } = createTestClient(server);

    const res = await mutate({
      mutation: Queries.CREATE_USER,
      variables: {
        username: 'ab',
        password: '12345',
        email: 'test@test.fi',
        fullname: 'Short username',
      },
    });

    let error = '';
    if (res.errors) error = res.errors[0].message;

    expect(error).toMatch(/username must be at least 3 characters/);
    expect(res.data).toEqual({ createUser: null });
  });

  it('new user with too short password cannot be created', async () => {
    const { mutate } = createTestClient(server);

    const res = await mutate({
      mutation: Queries.CREATE_USER,
      variables: {
        username: 'testUser',
        password: '1234',
        email: 'test@test.fi',
        fullname: 'Test User',
      },
    });

    let error = '';
    if (res.errors) error = res.errors[0].message;

    expect(error).toMatch(/password must be at least 5 characters/);
    expect(res.data).toEqual({ createUser: null });
  });

  it('new user with empty fullname cannot be created', async () => {
    const { mutate } = createTestClient(server);

    const res = await mutate({
      mutation: Queries.CREATE_USER,
      variables: {
        username: 'testUser',
        password: '12345',
        email: 'test@test.fi',
        fullname: '',
      },
    });

    let error = '';
    if (res.errors) error = res.errors[0].message;

    expect(error).toMatch(/full name required/);
    expect(res.data).toEqual({ createUser: null });
  });

  it('new user with missing fullname cannot be created', async () => {
    const { mutate } = createTestClient(server);

    const res = await mutate({
      mutation: Queries.CREATE_USER,
      variables: {
        username: 'testUser',
        password: '12345',
        email: 'test@test.fi',
      },
    });

    let error = '';
    if (res.errors) error = res.errors[0].message;

    expect(error).toMatch(
      /Variable "\$fullname" of required type "String!" was not provided/
    );
    expect(res.data).not.toBeDefined();
  });

  it('new user with malformatted email cannot be created', async () => {
    const { mutate } = createTestClient(server);

    const res = await mutate({
      mutation: Queries.CREATE_USER,
      variables: {
        username: 'testUser',
        password: '12345',
        email: 'notrealemail',
        fullname: 'Test User',
      },
    });

    let error = '';
    if (res.errors) error = res.errors[0].message;

    expect(error).toMatch(/email must be valid e-mail/);
    expect(res.data).toEqual({ createUser: null });
  });

  it('new user with empty email cannot be created', async () => {
    const { mutate } = createTestClient(server);

    const res = await mutate({
      mutation: Queries.CREATE_USER,
      variables: {
        username: 'testUser',
        password: '12345',
        email: '',
        fullname: 'Test User',
      },
    });

    let error = '';
    if (res.errors) error = res.errors[0].message;

    expect(error).toMatch(/email required/);
    expect(res.data).toEqual({ createUser: null });
  });

  it('new user with missing email cannot be created', async () => {
    const { mutate } = createTestClient(server);

    const res = await mutate({
      mutation: Queries.CREATE_USER,
      variables: {
        username: 'testUser',
        password: '12345',
        fullname: 'Test User',
      },
    });

    let error = '';
    if (res.errors) error = res.errors[0].message;

    expect(error).toMatch(
      /Variable "\$email" of required type "String!" was not provided/
    );
    expect(res.data).not.toBeDefined();
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
      res.data && res.data.login ? (res.data.login as LoginData) : { token: '' };
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
      res.data && res.data.login ? (res.data.login as LoginData) : { token: '' };
    expect(loginData.token).toHaveLength(0);
  });
});

describe('user deletion', () => {
  it('user can delete own account', async () => {
    const { mutate } = createTestClient(
      new ApolloServer({
        typeDefs,
        resolvers,
        context: createContextWithUser('user'),
      })
    );

    const res = await mutate({
      mutation: Queries.DELETE_USER,
      variables: {
        username: 'user',
      },
    });

    interface UserData {
      username: string;
      fullname: string;
    }

    const userData =
      res.data && res.data.deleteUser
        ? (res.data.deleteUser as UserData)
        : { username: '', fullname: '' };
    expect(userData.fullname).toBe('Normal User');
  });

  it('user cannot delete other account', async () => {
    const { mutate } = createTestClient(
      new ApolloServer({
        typeDefs,
        resolvers,
        context: createContextWithUser('special'),
      })
    );

    const res = await mutate({
      mutation: Queries.DELETE_USER,
      variables: {
        username: 'user',
      },
    });

    interface UserData {
      username: string;
      fullname: string;
    }

    const userData =
      res.data && res.data.deleteUser
        ? (res.data.deleteUser as UserData)
        : { username: '', fullname: '' };
    expect(userData.fullname).not.toBe('Normal User');
  });

  it('admin can delete any account', async () => {
    const { mutate } = createTestClient(
      new ApolloServer({
        typeDefs,
        resolvers,
        context: createContextWithUser('admin'),
      })
    );

    const res = await mutate({
      mutation: Queries.DELETE_USER,
      variables: {
        username: 'user',
      },
    });

    interface UserData {
      username: string;
      fullname: string;
    }

    const userData =
      res.data && res.data.deleteUser
        ? (res.data.deleteUser as UserData)
        : { username: '', fullname: '' };
    expect(userData.fullname).toBe('Normal User');
  });
});

describe('own info', () => {
  it('user can query own information', async () => {
    const { query } = createTestClient(
      new ApolloServer({
        typeDefs,
        resolvers,
        context: createContextWithUser('user'),
      })
    );

    const res = await query({ query: Queries.ME });

    interface UserData {
      fullname: string;
      id: string;
    }

    const userData =
      res.data && res.data.me ? (res.data.me as UserData) : { fullname: '', id: '' };
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
    expect(usersData).toHaveLength(3);
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
