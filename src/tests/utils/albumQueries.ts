import gql from 'graphql-tag';

const LIST_ALBUMS = gql`
  query {
    listAlbums {
      name,
      description,
      id,
    }
  }
`;

const CREATE_ALBUM = gql`
  mutation createAlbum($name: String!, $description: String) {
    createAlbum(
      name: $name,
      description: $description,
    ) {
      name,
      description,
    }
  }
`;

const DELETE_ALBUM = gql`
  mutation deleteAlbum($id: ID!) {
    deleteAlbum(
      id: $id,
    ) {
      name,
      description,
      id,
    }
  }
`;

const EDIT_ALBUM = gql`
  mutation editAlbum(
    $id: ID!,
    $name: String!,
    $description: String,
  ) {
    editAlbum(
      id: $id,
      name: $name,
      description: $description,
    ) {
      id,
      name,
      description,
    }
  }
`;

export default {
  LIST_ALBUMS,
  CREATE_ALBUM,
  DELETE_ALBUM,
  EDIT_ALBUM,
};
