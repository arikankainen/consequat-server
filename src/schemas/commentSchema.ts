import { gql } from 'apollo-server-express';

export const commentSchema = gql`
  type Comment {
    dateAdded: String
    text: String!
    author: User!
    photo: Photo!
    id: ID!
  }

  type Query {
    listComments(photo: String, author: String): [Comment!]
  }

  type Mutation {
    createComment(
      text: String!
      photo: String!
    ): Comment

    deleteComment(
      id: ID!
    ): Comment
  }
`;
