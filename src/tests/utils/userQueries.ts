import gql from 'graphql-tag';

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

const EDIT_USER = gql`
  mutation editUser($id: ID!, $oldPassword: String, $newPassword: String, $email: String) {
    editUser(
      id: $id,
      oldPassword: $oldPassword,
      newPassword: $newPassword,
      email: $email,
    ) {
      password,
      email,
    }
  }
`;

const DELETE_USER = gql`
  mutation deleteUser($username: String!) {
    deleteUser(
      username: $username
    ) {
      username,
      fullname
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

const ME = gql`
  query me {
    me {
      id,
      fullname,
      password,
    }
  }
`;

export default {
  LOGIN,
  CREATE_USER,
  EDIT_USER,
  DELETE_USER,
  LIST_USERS,
  GET_USER,
  ME,
};
