const nodemailer = require("nodemailer");

//fields for testing on ethereal
const name = 'Helen McKenzie'
const user = 'imscouriertest@gmail.com'
const password = 'p4c!jZhzNBaE2_9CYuHb!q*f'

let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: user,
        pass: password,
    }
})

transporter.verify(function (error, success){
    if(error) {
        console.log(error);
    } else {
        console.log("server ready to take msgs");
    }
});

async function mail(){
    const info = await transporter.sendMail({
        from: `"${name}" <${user}>`,
        to: 'ianmstevenson1@gmail.com',
        subject: 'hello 2',
        text: 'hello world',
        html: '<b>Hello world?</b>'
    });

    console.log("message send: %s", info.messageId);
}

mail().catch(console.error);