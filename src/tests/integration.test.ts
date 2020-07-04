import { createTestClient } from 'apollo-server-testing';
import gql from 'graphql-tag';
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

beforeAll(async () => {
  await UserModel.deleteMany({});
});

describe('Mutations', () => {
  it('createUser works and returns created user', async () => {
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

  it('logged user receives token', async () => {
    const { mutate } = createTestClient(server);

    const res = await mutate({ mutation: LOGIN, variables: {
      username: 'testUser',
      password: '12345'
    }});

    const loginData = res.data && res.data.login ? res.data.login as { token: string } : { token: '' };
    expect(loginData.token).toHaveLength(177);
  });
});

describe('Queries', () => {
  it('lists added user', async () => {
    const { query } = createTestClient(server);
    const res = await query({ query: LIST_USERS });
    
    const queriedUserData = {
      listUsers: [
        {
          username: 'testUser',
          email: 'test@test.fi',
          fullname: 'Test User',
          isAdmin: false
        }
      ]
    };
    
    expect(res.data).toEqual(queriedUserData);
  });

  it('finds user by username', async () => {
    const { query } = createTestClient(server);
    const res = await query({ query: GET_USER, variables: { username: 'testUser' } });

    const userData = res.data && res.data.getUser ? res.data.getUser as { id: string, fullname: string } : { id: '', fullname: '' };
    expect(userData.id).toHaveLength(24);
    expect(userData.fullname).toBe('Test User');
  });
});

afterAll(async () => {
  await mongoose.disconnect();
});