///////////////////////////////////////////////////////////////////////////////
//                              Competitor Model                             //
///////////////////////////////////////////////////////////////////////////////

/*
 * This is means to contain a list of competitors in a specific meet along with the relays
 * the are willing to do. This information can be downloaded from the SwimPhone web page
 * (an app from club assistant) as a CSV. It will have to be uploaded and added to this collection.
 * We can keep competitors from previous meets but usually we are most interested in upcoming
 * meets (relay building and communication).
 */

const { Schema, model } = require('mongoose');

//need to define two schema for embedded subdocuments first (meets and relays)
const meetSchema = new Schema({
  title: {type: String, required: true,},
  startDate: {
    type: Date,
    required: true,
    get: d => d.toLocaleDateString(),
  },
  // TODO: validate that endDate >= startDate
  endDate: {
    type: Date,
    get: d => d.toLocaleDateString(),
  },
});

const relaySchema = new Schema({
  eventNum: {type: Number, required: true, unique: true,},
  distance: {type: Number, enum: [200, 400, 800],},
  relayStroke: {type: String, enum: ['Free', 'Medley'],},
  relayGender: {type: String, enum: ['M', 'F', 'X'],},
});

// now the main schema
const competitorSchema = new Schema({
  firstName: {type: String, required: true,},
  lastName: {type: String, required: true,},
  gender: {type: String, required: true,},
  // age on the first day of the meet
  age: {type: Number, required: true,},
  meet: {type: meetSchema, required: true,},
  relay: [relaySchema],
  // from the USMS ID we have access to the emails and other information
  usmsId: {type: String, ref: 'member'}
});

const Competitor = model('competitor', competitorSchema);
module.exports = Competitor;
