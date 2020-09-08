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

export default {
  LIST_PHOTOS,
  ADD_PHOTO,
};
