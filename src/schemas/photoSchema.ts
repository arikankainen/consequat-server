import { gql } from 'apollo-server-express';

export const photoSchema = gql`
  type Photo {
    mainUrl: String!
    thumbUrl: String!
    filename: String!
    thumbFilename: String!
    originalFilename: String!
    width: Int!
    height: Int!
    name: String!
    location: String
    description: String
    dateAdded: String
    tags: [String]
    user: User!
    album: Album
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
      width: Int!
      height: Int!
      name: String
      location: String
      description: String
      tags: [String]
      album: String
    ): Photo

    deletePhoto(
      id: ID!
    ): Photo

    editPhoto(
      name: String!
      location: String
      description: String
      tags: [String]
      album: String
      id: ID!
    ): Photo

    editPhotos(
      name: String
      location: String
      description: String
      tags: [String]
      album: String
      id: [ID!]!
    ): [Photo]
  }
`;
