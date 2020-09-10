import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

export interface Photo extends mongoose.Document {
  mainUrl: string;
  thumbUrl: string;
  filename: string;
  thumbFilename: string;
  originalFilename: string;
  name: string;
  location: string;
  description: string;
  dateAdded: string;
  tags: string[];
  user: string;
  album: string | null;
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
  filename: {
    type: String,
    required: true,
  },
  thumbFilename: {
    type: String,
    required: true,
  },
  originalFilename: {
    type: String,
    required: true,
  },
  name: String,
  location: String,
  description: String,
  dateAdded: {
    type: Date,
    default: Date.now,
  },
  tags: [String],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  album: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Album',
  },
});

photoSchema.plugin(uniqueValidator);

export default mongoose.model<Photo>('Photo', photoSchema);
