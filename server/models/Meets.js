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

// relays are embedded subdocuments
const relaySchema = new Schema({
  // relay event numbers as usually strings, eg "R22"
  eventNum: { type: String, required: true },
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
  // relays swimmer is willing to do, as event numbers
  relays: { type: [String], default: [] },
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
  relays: [relaySchema],
});

const Meet = model("meet", meetSchema);
module.exports = Meet;
