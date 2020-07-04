import { createTestClient } from 'apollo-server-testing';
import gql from 'graphql-tag';
import { server, mongoose } from '..';
import UserModel from '../models/user';

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
});

describe('Queries', () => {
  it('listUsers lists added user', async () => {
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
});

afterAll(async () => {
  await mongoose.disconnect();
});