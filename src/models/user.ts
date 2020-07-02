import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

export interface User extends mongoose.Document {
  username: string;
  password: string;
  email: string;
  fullname: string;
  id: string;
}

mongoose.set('useFindAndModify', true);
mongoose.set('useCreateIndex', true);

const userSchema: mongoose.Schema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    minlength: [3, 'username must be at least 3 characters']
  },
  password: String,
  email: String,
  fullname: String
});

userSchema.plugin(uniqueValidator);

export default mongoose.model<User>('User', userSchema);