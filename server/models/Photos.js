///////////////////////////////////////////////////////////////////////////////
//                                Photos Model                               //
///////////////////////////////////////////////////////////////////////////////

/*
 * Photos will be stored/retrieved in Google Photos using their API
 * Should only need a URL in order to display in an img tag element.
 */

const { Schema, model } = require('mongoose');

const photoSchema = new Schema({
  url: {
    // TODO add regex validation
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
