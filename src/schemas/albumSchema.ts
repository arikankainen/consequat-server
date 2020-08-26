import { gql } from 'apollo-server-express';

export const albumSchema = gql`
  type Album {
    name: String!
    description: String
    photos: [Photo!]
    user: User!
    id: ID!
  }

  type Query {
    listAlbums: [Album!]
  }

  type Mutation {
    createAlbum(
      name: String!
      description: String
    ): Album

    deleteAlbum(
      id: ID!
    ): Album

    editAlbum(
      name: String!
      description: String
      id: ID!
    ): Album
  }
`;