import { mergeTypeDefs } from '@graphql-tools/merge';
import { userSchema } from './userSchema';
import { photoSchema } from './photoSchema';
import { albumSchema } from './albumSchema';
import { commentSchema } from './commentSchema';

const typeDefs = [userSchema, photoSchema, albumSchema, commentSchema];

export default mergeTypeDefs(typeDefs);
