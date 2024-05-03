const nodemailer = require("nodemailer");

let mailConfig, user, name;

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

let transporter = nodemailer.createTransport(mailConfig);

transporter.verify(function (error){
    if(error) {
        console.log("error setting up smtp server\n\n");
        console.error;
        
    } else {
        console.log("server ready to take msgs");
        mail().catch(console.error);
    }
});

async function mail(){
    const info = await transporter.sendMail({
        from: `"${name}" <${user}>`,
        to: 'test@test.test',
        subject: 'hello 2',
        text: 'hello world',
        html: '<b>Hello world?</b>',
    });

    console.log("message send: %s", info.messageId);
}