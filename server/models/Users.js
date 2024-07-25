///////////////////////////////////////////////////////////////////////////////
//                                Users Model                                //
///////////////////////////////////////////////////////////////////////////////

/*
 * This is a model for people who create a users account on the site. They do not
 * necessarily have to be USMS/VMST members. There are a number of possible "roles"
 *
 * "user": can post comments in response to posts
 *   - does not need to be a USMS/VMST member
 *   - will eventually be able to flag comments for review as potentially inappropriate
 *   - login is by email and password; must also supply a first/last name for USMS lookup
 *   - when creating an account, users can request additional roles (leader, coach, admin).
 *     Such requests generate an email sent to team leaders and the admin
 * "leader": typically a VMST board member who can post and has emailing privileges.
 *   - a leader must be a USMS member of VMST
 *   - a leader will be copied on any request for a role beyond "user"
 *   - can upload CSV lists of competitors in an upcoming meet (and can communicate with them)
 *   - if/when a relay builder page exists, leaders will have access to it
 *   - a leader will eventually be able to delete comments and suspend/ban users
 * "coach": typically a workout group coach who can email members of their group.
 *   - a coach must be a USMS member of the specific workout group they want to email
 * "admin": generally the webmaster
 *   - can change roles of users (eg to coach or leader)
 *   - can delete comments that are inappropriate, can suspend/ban users, will be able to reset passwords
 * "membership": can upload CSV files to update the USMS LMSC membership roles
 *   - others cannot do this because they cannot generate the necessary reports and shouldn't have
 *     access to the email addresses
 */

const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new Schema({
  firstName: {type: String, required: true,},
  lastName: {type: String, required: true,},
  // email/password used to login
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^([a-zA-Z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/, 'Must match an email address!'],
    minLength: 1, // I read that empty strings pass the match validator
  },
  password: {type: String, required: true, minlength: 6,},
  role: {type: String, required: true, default: 'user',
    // must be one of the following values
    enum: ['user', 'leader', 'coach', 'membership', 'webmaster'],
  },
  notifications: {type: Boolean, default: false,},
  emailPermission: {type: Boolean, default: true,}
});

userSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('password')) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});

userSchema.methods.isCorrectPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

const User = model('user', userSchema);
module.exports =  User;
