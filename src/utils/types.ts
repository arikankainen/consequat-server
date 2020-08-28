export interface UserInToken {
  username: string;
  id: string;
}

export interface UserInContext {
  currentUser: {
    username: string;
    password: string;
    email: string;
    isAdmin: boolean;
    photos: string[];
    albums: string[];
    id: string;
  };
}
