import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

export interface Photo extends mongoose.Document {
  mainUrl: string;
  thumbUrl: string;
  name: string;
  description: string;
  dateAdded: string;
  user: string;
  id: string;
}

mongoose.set('useFindAndModify', true);
mongoose.set('useCreateIndex', true);

const photoSchema: mongoose.Schema = new mongoose.Schema({
  mainUrl: {
    type: String,
    unique: true,
    required: true,
  },
  thumbUrl: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: String,
  dateAdded: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

photoSchema.plugin(uniqueValidator);

export default mongoose.model<Photo>('Photo', photoSchema);