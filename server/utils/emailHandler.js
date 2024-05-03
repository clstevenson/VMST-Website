const nodemailer = require("nodemailer");
require('dotenv').config();

let mailConfig, user, name, transporter;

console.log('potato');

// theres a bug with the env file, it won't get the email or password, check it out
if (process.env.NODE_ENV === 'production') {
    //actual fields for sending real emails
    mailConfig = {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        }
    }
    name = 'Ian Stevenson'
    user = process.env.EMAIL
} else {
    //fields for testing on ethereal
    mailConfig = {
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: 'helen.mckenzie@ethereal.email',
            pass: 'MsABp8ggyck7VdHcgV',
        }
    }
    name = "test"
    user = 'helen.mckenzie@ethereal.email'
}

const Mail = async (mailData) => {
    transporter = nodemailer.createTransport(mailConfig);

    transporter.verify(function (error) {
        if (error) {
            console.log("error setting up smtp server\n\n");
            console.error;

        } else {
            console.log("server ready to take msgs");
        }
    });

    const info = await transporter.sendMail({
        from: `"${mailData.from}" <${mailData.replyTo}>`,
        to: mailData.emails,
        subject: mailData.subject,
        text: mailData.plainText,
        html: mailData.html,
    });

    console.log("message send: %s", info.messageId);
}

module.exports = Mail;