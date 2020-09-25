import { AuthenticationError } from 'apollo-server-express';
import CommentModel, { Comment } from '../models/comment';
import { Photo } from '../models/photo';
import { User } from '../models/user';
import { UserInContext } from '../utils/types';
import { isError } from '../utils/typeguards';

interface ListCommentsArgs {
  photo?: Photo;
  author?: User;
}

export const commentResolver = {
  Query: {
    listComments: async (
      _root: undefined,
      args: ListCommentsArgs
    ): Promise<Comment[]> => {
      const photoId = args.photo;
      const authorId = args.author;

      let photoFilter = {};
      let authorFilter = {};

      if (photoId) {
        photoFilter = { photo: photoId };
      }

      if (authorId) {
        authorFilter = { author: authorId };
      }

      return await CommentModel.find({
        $and: [photoFilter, authorFilter],
      }).populate('author');
    },
  },

  Mutation: {
    createComment: async (
      _root: undefined,
      args: Comment,
      context: UserInContext
    ): Promise<Comment | null> => {
      const currentUser = context.currentUser;

      if (!currentUser) {
        throw new AuthenticationError('Not authenticated');
      }

      const comment = new CommentModel({
        text: args.text,
        photo: args.photo,
        author: currentUser.id,
      });

      try {
        return await comment.save();
      } catch (error) {
        const message = isError(error) ? error.message : '';
        throw new Error(message);
      }
    },

    deleteComment: async (
      _root: undefined,
      args: { id: string },
      context: UserInContext
    ): Promise<Comment | null> => {
      const currentUser = context.currentUser;
      const id = args.id;

      const existingComment = await CommentModel.findById(id);
      if (!existingComment) throw new Error('Comment not found');

      const isOwnComment = currentUser.id === String(existingComment.author);

      if (!currentUser || (!currentUser.isAdmin && !isOwnComment)) {
        throw new AuthenticationError('Not authenticated');
      }

      try {
        return await CommentModel.findByIdAndDelete(args.id);
      } catch (error) {
        const message = isError(error) ? error.message : '';
        throw new Error(message);
      }
    },
  },
};
