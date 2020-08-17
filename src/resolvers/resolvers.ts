import { mergeResolvers } from '@graphql-tools/merge';
import { userResolver } from './userResolver';
import { photoResolver } from './photoResolver';

const resolvers = [
  userResolver,
  photoResolver,
];

export default mergeResolvers(resolvers);