import { mergeTypeDefs } from '@graphql-tools/merge';
import { userSchema } from './userSchema';
import { photoSchema } from './photoSchema';
import { albumSchema } from './albumSchema';

const typeDefs = [userSchema, photoSchema, albumSchema];

export default mergeTypeDefs(typeDefs);
