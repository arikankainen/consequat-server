interface Resolvers {
  username: string;
  realname: string;
}

export const resolvers = {
  Query: {
    testQuery: (): Resolvers => {
      return { username: 'testUsername', realname: 'testRealname' };
    }
  }
};
