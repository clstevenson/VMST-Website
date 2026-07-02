///////////////////////////////////////////////////////////////////////////////
//                           MembershipUpload Model                          //
///////////////////////////////////////////////////////////////////////////////

/*
 * One document per successful USMS roster upload (Mutation.uploadMembers),
 * recording when it happened. Leaders/coaches see the most recent one so
 * they know how stale the Member collection might be -- see
 * Query.membershipUploadInfo in server/schemas/resolvers.js.
 *
 * No TTL: uploads are infrequent, so keeping the full history costs nothing.
 */

const { Schema, model } = require('mongoose');

const membershipUploadSchema = new Schema({
  uploadedAt: { type: Date, default: Date.now, required: true },
});

const MembershipUpload = model('membershipupload', membershipUploadSchema);
module.exports = MembershipUpload;
