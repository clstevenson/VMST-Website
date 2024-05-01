const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
        user: 'helen.mckenzie@ethereal.email',
        pass: 'MsABp8ggyck7VdHcgV'
    }
})

async function mail(){
    const info = await transporter.sendMail({
        from: '"Helen McKenzie" <helen.mckenzie@ethereal.email>',
        to: 'bar@example.com, baz@example.com',
        subject: 'hello',
        text: 'hello world',
        html: '<b>Hello world?</b>'
    });

    console.log("message send: %s", info.messageId);
}

mail().catch(console.error);