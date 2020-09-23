import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

export interface Comment extends mongoose.Document {
  dateAdded: string;
  text: string;
  author: string;
  photo: string;
  id: string;
}

mongoose.set('useFindAndModify', true);
mongoose.set('useCreateIndex', true);

const commentSchema: mongoose.Schema = new mongoose.Schema({
  dateAdded: {
    type: Date,
    default: Date.now,
  },
  text: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  photo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Photo',
  },
});

commentSchema.plugin(uniqueValidator);

export default mongoose.model<Comment>('Comment', commentSchema);
