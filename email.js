const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    //secure: false, // true for 465, false for other ports
    auth: {
        user: 'f94adb1081a39d', 
        pass: 'b9458ed2d4a7ea', 
    },
})

module.exports = transporter