///////////////////////////////////////////////////////////////////////////////
//                                Meets Model                                //
///////////////////////////////////////////////////////////////////////////////

/*
 * This is means to contain a list of meets with the swimmers who signed up for them and
 * the relays they are willing to do. This information can be downloaded from the SwimPhone web page
 * (an app from club assistant) as a CSV. It will have to be uploaded and added to this collection.
 * We can keep competitors from previous meets but usually we are most interested in upcoming
 * meets (relay building and communication).
 */

const { Schema, model } = require("mongoose");

// relay event objects are embedded subdocuments
const relaySchema = new Schema({
  // relay event number as an integer, eg 22 for the "R22" column in the CSV
  eventNum: { type: Number, required: true },
  distance: { type: Number, enum: [200, 400, 800] },
  relayStroke: { type: String, enum: ["Free", "Medley"] },
  relayGender: { type: String, enum: ["M", "F", "X"] },
});

// competitors are embedded subdocs as well
const competitors = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: { type: String, required: true },
  meetAge: { type: Number, required: true },
  // relay event numbers the swimmer is willing to do, as integers
  relays: { type: [Number], default: [] },
  // USMS ID will allow lookup of a member (assuming they are still registered)
  usmsId: String,
  // include in email messages
  includeEmail: { type: Boolean, required: true },
});

const meetSchema = new Schema({
  meetName: { type: String, required: true },
  course: {
    type: String,
    enum: {
      values: ["SCY", "SCM", "LCM"],
      message: "{VALUE} is not a valid course",
    },
    required: true,
  },
  startDate: {
    type: String,
    required: true,
  },
  // TODO: validate that endDate >= startDate
  endDate: String,
  meetSwimmers: [competitors],
  relayEvents: [relaySchema],
});

const Meet = model("meet", meetSchema);
module.exports = Meet;
