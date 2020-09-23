import gql from 'graphql-tag';

const LIST_COMMENTS = gql`
  query listComments($photo: String, $author: String) {
    listComments(
      photo: $photo,
      author: $author,
    ) {
      dateAdded,
      text,
      id,
    }
  }
`;

const CREATE_COMMENT = gql`
  mutation createComment(
    $text: String!,
    $photo: String!,
  ) {
    createComment(
      text: $text,
      photo: $photo,
    ) {
      dateAdded,
      text,
      id,
    }
  }
`;

const DELETE_COMMENT = gql`
  mutation deleteComment(
    $id: ID!,
  ) {
    deleteComment(
      id: $id,
    ) {
      dateAdded,
      text,
      id,
    }
  }
`;

export default {
  LIST_COMMENTS,
  CREATE_COMMENT,
  DELETE_COMMENT,
};
