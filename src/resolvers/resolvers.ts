import { mergeResolvers } from '@graphql-tools/merge';
import { userResolver } from './userResolver';
import { photoResolver } from './photoResolver';
import { albumResolver } from './albumResolver';
import { commentResolver } from './commentResolver';

const resolvers = [userResolver, photoResolver, albumResolver, commentResolver];

export default mergeResolvers(resolvers);
