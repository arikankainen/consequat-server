import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

export interface User extends mongoose.Document {
  username: string;
  password: string;
  email: string;
  fullname: string;
  isAdmin: boolean;
  photos: string[];
  albums: string[];
  id: string;
}

mongoose.set('useFindAndModify', true);
mongoose.set('useCreateIndex', true);

const userSchema: mongoose.Schema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    minlength: [3, 'username must be at least 3 characters'],
  },
  password: String,
  email: {
    type: String,
    unique: true,
    required: true,
  },
  fullname: String,
  isAdmin: Boolean,
  photos: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Photo',
    },
  ],
  albums: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Album',
    },
  ],
});

userSchema.plugin(uniqueValidator);

export default mongoose.model<User>('User', userSchema);
