import { mergeTypeDefs } from '@graphql-tools/merge';
import { userSchema } from './userSchema';

const typeDefs = [
  userSchema
];

export default mergeTypeDefs(typeDefs);