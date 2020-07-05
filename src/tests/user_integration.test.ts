import { createTestClient } from 'apollo-server-testing';
import bcrypt from 'bcrypt';
import { server, mongoose, typeDefs, resolvers, ApolloServer } from '..';
import UserModel from '../models/user';
import { createContextWithUser } from './utils/utils';
import { initialUsers } from './utils/initialData';
import Queries from './utils/userQueries';

beforeEach(async () => {
  await UserModel.deleteMany({});

  const userObjects = await Promise.all(initialUsers.map(async user => {
    const saltRounds = 10;
    const hash = await bcrypt.hash(user.password, saltRounds);
    user = { ...user, password: hash };
    return new UserModel(user);
  }));

  await UserModel.insertMany(userObjects);
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('Mutations', () => {
  it('new user can be created', async () => {
    const { mutate } = createTestClient(server);

    const res = await mutate({ mutation: Queries.CREATE_USER, variables: {
      username: 'testUser',
      password: '12345',
      email: 'test@test.fi',
      fullname: 'Test User'
    }});
    
    const createdUserData = {
      createUser: {
        username: 'testUser',
        email: 'test@test.fi',
        fullname: 'Test User',
        isAdmin: false
      }
    };
    
    expect(res.data).toEqual(createdUserData);
  });

  it('user can login and receives token', async () => {
    const { mutate } = createTestClient(server);

    const res = await mutate({ mutation: Queries.LOGIN, variables: {
      username: 'admin',
      password: '12345'
    }});

    interface LoginData {
      token: string
    }

    const loginData = res.data && res.data.login ? res.data.login as LoginData : { token: '' };
    expect(loginData.token).toHaveLength(173);
  });

  it('user can delete own account', async () => {
    const { mutate } = createTestClient(
      new ApolloServer({
        typeDefs,
        resolvers,
        context: createContextWithUser('user')
      })
    );

    const res = await mutate({ mutation: Queries.DELETE_USER, variables: {
      username: 'user'
    }});

    interface UserData {
      username: string;
      fullname: string;
    }

    const userData = res.data && res.data.deleteUser ? res.data.deleteUser as UserData : { username: '', fullname: '' };
    expect(userData.fullname).toBe('Normal User');
  });

  it('user cannot delete other account', async () => {
    const { mutate } = createTestClient(
      new ApolloServer({
        typeDefs,
        resolvers,
        context: createContextWithUser('special')
      })
    );

    const res = await mutate({ mutation: Queries.DELETE_USER, variables: {
      username: 'user'
    }});

    interface UserData {
      username: string;
      fullname: string;
    }

    const userData = res.data && res.data.deleteUser ? res.data.deleteUser as UserData : { username: '', fullname: '' };
    expect(userData.fullname).not.toBe('Normal User');
  });

  it('admin can delete any account', async () => {
    const { mutate } = createTestClient(
      new ApolloServer({
        typeDefs,
        resolvers,
        context: createContextWithUser('admin')
      })
    );

    const res = await mutate({ mutation: Queries.DELETE_USER, variables: {
      username: 'user'
    }});

    interface UserData {
      username: string;
      fullname: string;
    }

    const userData = res.data && res.data.deleteUser ? res.data.deleteUser as UserData : { username: '', fullname: '' };
    expect(userData.fullname).toBe('Normal User');
  });
});

describe('Queries', () => {
  it('lists all users', async () => {
    const { query } = createTestClient(server);
    const res = await query({ query: Queries.LIST_USERS });
    
    interface UserData {
      username: string,
      email: string,
      fullname: string,
      isAdmin: boolean
    }

    const usersData = res.data && res.data.listUsers ? res.data.listUsers as UserData[] : [];
    expect(usersData).toHaveLength(3);
  });

  it('finds user by username', async () => {
    const { query } = createTestClient(server);
    const res = await query({ query: Queries.GET_USER, variables: { username: 'admin' } });

    interface UserData {
      id: string,
      fullname: string
    }

    const userData = res.data && res.data.getUser ? res.data.getUser as UserData : { id: '', fullname: '' };
    expect(userData.id).toHaveLength(24);
    expect(userData.fullname).toBe('Administrator');
  });
});