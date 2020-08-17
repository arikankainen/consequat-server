import { mergeResolvers } from '@graphql-tools/merge';
import { userResolver } from './userResolver';

const resolvers = [
  userResolver,
];

export default mergeResolvers(resolvers);