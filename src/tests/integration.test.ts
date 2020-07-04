import { createTestClient } from 'apollo-server-testing';
import gql from 'graphql-tag';
import bcrypt from 'bcrypt';

import { server, mongoose } from '..';
import UserModel from '../models/user';

const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(
      username: $username,
      password: $password
    ) {
      token
    }
  }
`;

const CREATE_USER = gql`
  mutation createUser($username: String!, $password: String!, $email: String!, $fullname: String!) {
    createUser(
      username: $username,
      password: $password,
      email: $email,
      fullname: $fullname
    ) {
      username,
      email,
      fullname,
      isAdmin
    }
  }
`;

const LIST_USERS = gql`
  query {
    listUsers {
      username,
      email,
      fullname,
      isAdmin
    }
  }
`;

const GET_USER = gql`
  query getUser($username: String!) {
    getUser(
      username: $username
    ) {
      id,
      fullname
    }
  }
`;

const initialUsers = [
  {
    username: 'admin',
    password: '12345',
    email: 'admin@test.fi',
    fullname: 'Administrator',
    isAdmin: true
  },
  {
    username: 'user',
    password: '00000',
    email: 'user@test.fi',
    fullname: 'Normal User',
    isAdmin: false
  },
  {
    username: 'special',
    password: '99999',
    email: 'special@admin.fi',
    fullname: 'Special User',
    isAdmin: false
  }
];

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

describe('Mutations', () => {
  it('new user can be created', async () => {
    const { mutate } = createTestClient(server);

    const res = await mutate({ mutation: CREATE_USER, variables: {
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

    const res = await mutate({ mutation: LOGIN, variables: {
      username: 'admin',
      password: '12345'
    }});

    interface Data {
      token: string
    }

    const loginData = res.data && res.data.login ? res.data.login as Data : { token: '' };
    expect(loginData.token).toHaveLength(173);
  });
});

describe('Queries', () => {
  it('lists all users', async () => {
    const { query } = createTestClient(server);
    const res = await query({ query: LIST_USERS });
    
    interface Data {
      username: string,
      email: string,
      fullname: string,
      isAdmin: boolean
    }

    const usersData = res.data && res.data.listUsers ? res.data.listUsers as Data[] : [];
    expect(usersData).toHaveLength(3);
  });

  it('finds user by username', async () => {
    const { query } = createTestClient(server);
    const res = await query({ query: GET_USER, variables: { username: 'admin' } });

    interface Data {
      id: string,
      fullname: string
    }

    const userData = res.data && res.data.getUser ? res.data.getUser as Data : { id: '', fullname: '' };
    expect(userData.id).toHaveLength(24);
    expect(userData.fullname).toBe('Administrator');
  });
});

afterAll(async () => {
  await mongoose.disconnect();
});