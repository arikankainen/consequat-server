import gql from 'graphql-tag';

const LIST_PHOTOS = gql`
  query {
    listPhotos {
      mainUrl,
      thumbUrl,
      filename,
      thumbFilename,
      originalFilename,
      name,
      location,
      description,
      id,
    }
  }
`;

const ADD_PHOTO = gql`
  mutation addPhoto(
    $mainUrl: String!,
    $thumbUrl: String!,
    $filename: String!,
    $thumbFilename: String!,
    $originalFilename: String!,
    $name: String!,
    $location: String,
    $description: String,
  ) {
    addPhoto(
      mainUrl: $mainUrl,
      thumbUrl: $thumbUrl,
      filename: $filename,
      thumbFilename: $thumbFilename,
      originalFilename: $originalFilename,
      name: $name,
      location: $location,
      description: $description,
    ) {
      filename,
      name,
      description,
      id,
    }
  }
`;

const DELETE_PHOTO = gql`
  mutation deletePhoto(
    $id: ID!,
  ) {
    deletePhoto(
      id: $id,
    ) {
      filename,
      name,
      description,
      id,
    }
  }
`;

const EDIT_PHOTO = gql`
  mutation editPhoto(
    $id: ID!,
    $name: String!,
    $location: String,
    $description: String,
    $album: String,
  ) {
    editPhoto(
      id: $id,
      name: $name,
      location: $location,
      description: $description,
      album: $album,
    ) {
      id,
      name,
      location,
      description,
    }
  }
`;

const EDIT_PHOTOS = gql`
  mutation editPhotos(
    $id: [ID!]!,
    $name: String,
    $location: String,
    $description: String,
    $album: String,
  ) {
    editPhotos(
      id: $id,
      name: $name,
      location: $location,
      description: $description,
      album: $album,
    ) {
      id,
      name,
      location,
      description,
    }
  }
`;

export default {
  LIST_PHOTOS,
  ADD_PHOTO,
  DELETE_PHOTO,
  EDIT_PHOTO,
  EDIT_PHOTOS,
};
