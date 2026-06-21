///////////////////////////////////////////////////////////////////////////////
//                             USMS Members Model                            //
///////////////////////////////////////////////////////////////////////////////

/*
 * This model contains USMS membership information about all LMSC members. It must
 * be updated by CSV upload by the Membership Coordinator.
 */

const { Schema, model } = require("mongoose");

// formatValid is recomputed fresh on every upload (a pure function of the address
// string). deliverable is sticky -- it's preserved across uploads for an address
// whose string is unchanged, and only ever set to false by the membership
// coordinator (via the email columns on the upload page, after a real bounce).
// It defaults to true: an address nobody has flagged is assumed reachable.
const emailSchema = new Schema(
  {
    address: { type: String, required: true },
    formatValid: { type: Boolean, required: true },
    deliverable: { type: Boolean, required: true, default: true },
  },
  { _id: false },
);

const memberSchema = new Schema({
  // this is the number that changes every year and is unique (even if member listed twice)
  usmsRegNo: { type: String, required: true, unique: true, index: true },
  // the USMS ID is the last 5 characters of the registration number -- unlike
  // usmsRegNo, this is stable across registration years and is the key used to
  // merge/dedupe members on upload (see uploadMembers resolver)
  usmsId: { type: String, required: true, unique: true, index: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: { type: String, required: true },
  club: { type: String, required: true },
  workoutGroup: String,
  regYear: { type: Number, required: true },
  emails: { type: [emailSchema], default: [] },
  // did member opt out of receiving LMSC emails?
  emailExclude: { type: Boolean, default: false },
});

const Member = model("member", memberSchema);
module.exports = Member;
