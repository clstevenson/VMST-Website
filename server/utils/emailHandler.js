const nodemailer = require("nodemailer");

//fields for testing on ethereal
const name = 'Helen McKenzie'
const user = 'helen.mckenzie@ethereal.email'
const password = 'MsABp8ggyck7VdHcgV'

let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
        user: user,
        pass: password
    }
})

async function mail(){
    const info = await transporter.sendMail({
        from: `"${name}" <${user}>`,
        to: 'bar@example.com, baz@example.com',
        subject: 'hello',
        text: 'hello world',
        html: '<b>Hello world?</b>'
    });

    console.log("message send: %s", info.messageId);
}

mail().catch(console.error);