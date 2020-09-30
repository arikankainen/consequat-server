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
      hidden,
      tags,
      id,
    }
  }
`;

const GET_PHOTO = gql`
  query getPhoto($id: String!) {
    getPhoto(id: $id) {
      mainUrl,
      thumbUrl,
      filename,
      thumbFilename,
      originalFilename,
      name,
      location,
      description,
      hidden,
      tags,
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
    $width: Int!,
    $height: Int!,
    $name: String!,
    $location: String,
    $description: String,
    $hidden: Boolean,
    $tags: [String],
  ) {
    addPhoto(
      mainUrl: $mainUrl,
      thumbUrl: $thumbUrl,
      filename: $filename,
      thumbFilename: $thumbFilename,
      originalFilename: $originalFilename,
      width: $width,
      height: $height,
      name: $name,
      location: $location,
      description: $description,
      hidden: $hidden,
      tags: $tags,
    ) {
      filename,
      name,
      description,
      tags,
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
    $hidden: Boolean,
    $tags: [String],
    $album: String,
  ) {
    editPhoto(
      id: $id,
      name: $name,
      location: $location,
      description: $description,
      hidden: $hidden,
      tags: $tags,
      album: $album,
    ) {
      id,
      name,
      location,
      description,
      tags,
    }
  }
`;

const EDIT_PHOTOS = gql`
  mutation editPhotos(
    $id: [ID!]!,
    $name: String,
    $location: String,
    $description: String,
    $hidden: Boolean,
    $tags: [String],
    $album: String,
  ) {
    editPhotos(
      id: $id,
      name: $name,
      location: $location,
      description: $description,
      hidden: $hidden,
      tags: $tags,
      album: $album,
    ) {
      id,
      name,
      location,
      description,
      tags,
    }
  }
`;

const EDIT_TAGS = gql`
  mutation editTags(
    $id: [ID!]!,
    $addedTags: [String],
    $deletedTags: [String],
  ) {
    editTags(
      id: $id,
      addedTags: $addedTags,
      deletedTags: $deletedTags,
    ) {
      id,
      name,
      location,
      description,
      tags,
    }
  }
`;

export default {
  LIST_PHOTOS,
  GET_PHOTO,
  ADD_PHOTO,
  DELETE_PHOTO,
  EDIT_PHOTO,
  EDIT_PHOTOS,
  EDIT_TAGS,
};
