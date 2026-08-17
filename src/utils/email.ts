import nodemailer from "nodemailer";
import { MESSAGES } from "../constants/messages/tr";
export const sendPasswordResetEmail = async (to: string, otpCode: string) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 465,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    const mailOptions = {
        from: '"Mensola Team" <' + process.env.SMTP_USER + ">",
        to,
        subject: MESSAGES.EMAILS.PASSWORD_RESET_SUBJECT,
        text: MESSAGES.EMAILS.PASSWORD_RESET_BODY(otpCode)
    };

    await transporter.sendMail(mailOptions);
};
