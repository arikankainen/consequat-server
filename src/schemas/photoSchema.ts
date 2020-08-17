import { gql } from 'apollo-server-express';

export const photoSchema = gql`
  type Photo {
    mainUrl: String!
    thumbUrl: String!
    name: String!
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
      name: String!
    ): Photo
  }
`;