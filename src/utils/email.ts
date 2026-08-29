import nodemailer from "nodemailer";
import { MESSAGES } from "@/constants/messages";
export const sendPasswordResetEmail = async (to: string, otpCode: string) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 465,
            secure: Number(process.env.SMTP_PORT) === 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const mailOptions = {
            from: "mensola <noreply@mensola.app>",
            to,
            subject: MESSAGES.EMAILS.PASSWORD_RESET_SUBJECT,
            text: MESSAGES.EMAILS.PASSWORD_RESET_BODY(otpCode),
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.log(error);
    }
};

export const sendBetaWaitlistEmail = async (to: string) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 465,
            secure: Number(process.env.SMTP_PORT) === 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const mailOptions = {
            from: "mensola <hello@mensola.app>",
            to,
            subject: "You're on the mensola waitlist! 🚀",
            text: `Hi there,\n\nThanks for joining the private beta waitlist for mensola.\n\nWe are preparing the first wave of invites. As soon as your spot opens up, we’ll send your direct access link right here to this email address.\n\nIn the meantime, you can follow updates on X: https://x.com/mensolaapp\n\n— The mensola team`,
            html: `
                <div style="font-family: sans-serif; line-height: 1.6; color: #111;">
                <p>Hi there,</p>
                <p>Thanks for joining the private beta waitlist for <strong>mensola</strong>.</p>
                <p>We are preparing the first wave of invites. As soon as your spot opens up, we’ll send your direct access link right here to this email address.</p>
                <p>In the meantime, you can follow updates on <a href="https://x.com/mensolaapp" style="color: #000; text-decoration: underline;">X (@mensolaapp)</a>.</p>
                <br />
                <p>— The mensola team</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.log("Error sending beta waitlist email:", error);
    }
};

export const sendEmailChangeVerificationCode = async (to: string, otpCode: string) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 465,
            secure: Number(process.env.SMTP_PORT) === 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const mailOptions = {
            from: "mensola <noreply@mensola.app>",
            to,
            subject: MESSAGES.EMAILS.EMAIL_CHANGE_SUBJECT,
            text: MESSAGES.EMAILS.EMAIL_CHANGE_BODY(otpCode),
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.log("Error sending email change verification code:", error);
    }
};
