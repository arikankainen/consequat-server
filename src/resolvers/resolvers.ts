import { mergeResolvers } from '@graphql-tools/merge';
import { userResolver } from './userResolver';
import { photoResolver } from './photoResolver';
import { albumResolver } from './albumResolver';

const resolvers = [
  userResolver,
  photoResolver,
  albumResolver
];

export default mergeResolvers(resolvers);