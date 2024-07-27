///////////////////////////////////////////////////////////////////////////////
//                                Photos Model                               //
///////////////////////////////////////////////////////////////////////////////

/*
 * DB for photos that are displayed on this website, will integrate with Flickr API.
 */

const { Schema, model } = require('mongoose');

const photoSchema = new Schema({
  url: {
    // TODO add regex validation (after switch to Flickr API)
    type: String,
    required: true,
  },
  caption: String,
  names: [String],
  permission: Boolean,
  uploadedAt: {
    type: Date,
    default: () => new Date(),
    get: d => d.toLocaleString(),
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: false,
  },
},
  {
    toJSON: { getters: true },
  },
);

const Photo = model('photo', photoSchema);
module.exports = Photo;
