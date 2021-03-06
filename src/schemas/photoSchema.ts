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
    gpsLatitude: Float!
    gpsLongitude: Float!
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
    gpsLatitude: Float!
    gpsLongitude: Float!
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

  type TagPhoto {
    tag: String!
    photos: [Photo!]!
  }

  type ListPhotos {
    totalCount: Int!
    photos: [Photo!]
  }

  type Query {
    listPhotos(type: [String], keyword: String, offset: Int, limit: Int): ListPhotos
    getPhoto(id: String!): Photo
    topTags(tags: Int!, photosPerTag: Int!): [TagPhoto]
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
