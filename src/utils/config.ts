import dotenv from 'dotenv';
dotenv.config();

export const MONGODB_URI = process.env.NODE_ENV === 'development' ? process.env['MONGODB_URI_TEST'] : process.env['MONGODB_URI_PROD'];
