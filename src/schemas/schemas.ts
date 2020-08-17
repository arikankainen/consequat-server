import { mergeTypeDefs } from '@graphql-tools/merge';
import { userSchema } from './userSchema';
import { photoSchema } from './photoSchema';

const typeDefs = [
  userSchema,
  photoSchema,
];

export default mergeTypeDefs(typeDefs);