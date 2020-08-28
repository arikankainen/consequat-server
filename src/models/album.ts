import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

export interface Album extends mongoose.Document {
  name: string;
  description: string;
  photos: string[];
  user: string;
  id: string;
}

mongoose.set('useFindAndModify', true);
mongoose.set('useCreateIndex', true);

const albumSchema: mongoose.Schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  photos: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Photo',
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

albumSchema.plugin(uniqueValidator);

export default mongoose.model<Album>('Album', albumSchema);
