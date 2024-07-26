const nodemailer = require("nodemailer");
require('dotenv').config();

let mailConfig, user, name, transporter;

// theres a bug with the env file, it won't get the email or password, check it out
if (process.env.NODE_ENV === 'production') {
  //actual fields for sending real emails
  mailConfig = {
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    }
  }
} else {
  //fields for testing on ethereal
  mailConfig = {
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'vada80@ethereal.email',
      pass: 'nSjzC6JTYW75W4pQnj'
    }
  }
}

const Mail = async (mailData) => {
  transporter = nodemailer.createTransport(mailConfig);

  transporter.verify(function(error) {
    if (error) {
      console.log("error setting up smtp server\n\n");
      console.error;

    } else {
      console.log("server ready to take msgs");
    }
  });

  const info = await transporter.sendMail({
    to: mailData.emails,
    from: {
      name: mailData.from,
      address: mailData.replyTo,
    },
    replyTo: `${mailData.from} <${mailData.replyTo}>`,
    subject: mailData.subject,
    text: mailData.plainText,
    html: mailData.html,
  });

  console.log("message sent: %s", info.messageId);
  transporter = null;
}

module.exports = Mail;
