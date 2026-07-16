import nodemailer from "nodemailer";

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
        subject: "Password Reset Request",
        text: `Use this code to reset your password: ${otpCode}\n\nThis code is valid for 1 hour. If you did not request this, please disregard this email.`
    };

    await transporter.sendMail(mailOptions);
};
