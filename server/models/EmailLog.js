///////////////////////////////////////////////////////////////////////////////
//                              EmailLog Model                               //
///////////////////////////////////////////////////////////////////////////////

/*
 * One document per outbound send (across every resolver that calls Mail()),
 * recording how many recipients it reached and when. Used to compute a
 * rolling 24h recipient total against Gmail's daily sending limit -- see
 * getEmailUsage/nextAvailableSendTime in server/schemas/resolvers.js.
 *
 * The TTL index below prunes documents older than 30h (24h window + a
 * safety margin for TTL sweep delay, which runs periodically rather than
 * instantly) -- nothing here needs to outlive that.
 */

const { Schema, model } = require('mongoose');

const emailLogSchema = new Schema({
  sentAt: { type: Date, default: Date.now, required: true },
  recipientCount: { type: Number, required: true },
});

emailLogSchema.index({ sentAt: 1 }, { expireAfterSeconds: 60 * 60 * 30 });

const EmailLog = model('emaillog', emailLogSchema);
module.exports = EmailLog;
