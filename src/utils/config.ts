import dotenv from 'dotenv';
dotenv.config();

export const MONGODB_URI = process.env.NODE_ENV === 'development' ? process.env.MONGODB_URI_DEV : process.env.MONGODB_URI_PROD;
export const MONGODB_URI_TEST = process.env.MONGODB_URI_TEST;
export const JWT_PRIVATE_KEY = process.env.JWT_PRIVATE_KEY;