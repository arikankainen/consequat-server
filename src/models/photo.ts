import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

export interface Exif {
  dateTimeOriginal: string;
  fNumber: string;
  isoSpeedRatings: string;
  shutterSpeedValue: string;
  focalLength: string;
  flash: string;
  make: string;
  model: string;
}

export interface Photo extends mongoose.Document {
  mainUrl: string;
  thumbUrl: string;
  filename: string;
  thumbFilename: string;
  originalFilename: string;
  width: number;
  height: number;
  name: string;
  location: string;
  description: string;
  dateAdded: string;
  hidden: boolean;
  tags: string[];
  user: string;
  album: string | null;
  exif: Exif;
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
  width: {
    type: Number,
    required: true,
  },
  height: {
    type: Number,
    required: true,
  },
  name: String,
  location: String,
  description: String,
  dateAdded: {
    type: Date,
    default: Date.now,
  },
  hidden: Boolean,
  tags: [String],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  album: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Album',
  },
  exif: {
    type: Object,
    required: true,
  },
});

photoSchema.plugin(uniqueValidator);

export default mongoose.model<Photo>('Photo', photoSchema);
