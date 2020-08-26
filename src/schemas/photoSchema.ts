import { gql } from 'apollo-server-express';

export const photoSchema = gql`
  type Photo {
    mainUrl: String!
    thumbUrl: String!
    filename: String!
    thumbFilename: String!
    originalFilename: String!
    name: String
    location: String
    description: String
    dateAdded: String
    user: User!
    id: ID!
  }

  type Query {
    listPhotos: [Photo!]
  }

  type Mutation {
    addPhoto(
      mainUrl: String!
      thumbUrl: String!
      filename: String!
      thumbFilename: String!
      originalFilename: String!
      name: String
      location: String
      description: String
    ): Photo

    deletePhoto(
      id: ID!
    ): Photo

    editPhoto(
      name: String
      location: String
      description: String
      id: ID!
    ): Photo
  }
`;