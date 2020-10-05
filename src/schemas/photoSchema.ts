import { gql } from 'apollo-server-express';

export const photoSchema = gql`
  type Exif {
    dateTimeOriginal: String!
    fNumber: String!
    isoSpeedRatings: String!
    shutterSpeedValue: String!
    focalLength: String!
    flash: String!
    make: String!
    model: String!
  }

  input ExifInput {
    dateTimeOriginal: String!
    fNumber: String!
    isoSpeedRatings: String!
    shutterSpeedValue: String!
    focalLength: String!
    flash: String!
    make: String!
    model: String!
  }

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
    hidden: Boolean
    tags: [String]
    user: User!
    album: Album
    exif: Exif!
    id: ID!
  }

  type Query {
    listPhotos(type: [String], keyword: String): [Photo!]
    getPhoto(id: String!): Photo
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
      hidden: Boolean
      tags: [String]
      album: String
      exif: ExifInput!
    ): Photo

    deletePhoto(
      id: ID!
    ): Photo

    editPhoto(
      name: String!
      location: String
      description: String
      hidden: Boolean
      tags: [String]
      album: String
      id: ID!
    ): Photo

    editPhotos(
      name: String
      location: String
      description: String
      hidden: Boolean
      tags: [String]
      album: String
      id: [ID!]!
    ): [Photo]

    editTags(
      addedTags: [String]
      deletedTags: [String]
      id: [ID!]!
    ): [Photo]
  }
`;
