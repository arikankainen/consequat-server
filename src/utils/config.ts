import dotenv from 'dotenv';
dotenv.config();

//export const MONGODB_URI = process.env.NODE_ENV === 'development' ? process.env.MONGODB_URI_DEV : process.env.MONGODB_URI_PROD;
export const MONGODB_URI_TEST = process.env.MONGODB_URI_TEST;
export const JWT_PRIVATE_KEY = process.env.JWT_PRIVATE_KEY;

let env;

switch (process.env.NODE_ENV) {
  case 'production':
    env = process.env.MONGODB_URI_PROD;
    break;
  case 'development':
    env = process.env.MONGODB_URI_DEV;
    break;
  case 'test':
    env = process.env.MONGODB_URI_TEST;
    break;
}

export const MONGODB_URI = env;
