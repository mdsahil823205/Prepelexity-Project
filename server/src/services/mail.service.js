import dotenv from "dotenv"
dotenv.config()
import nodemailer from "nodemailer";
const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
    },
});

const sendMail = async ({ to, subject, html, text }) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html,
        text,
    };
    try {
        const details = await transport.sendMail(mailOptions);
        console.log("Mail sent successfully", details);
    } catch (error) {
        console.log(error);
    }
};

export default sendMail;
