import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.BACKEND_URL}/api/auth/verify/${token}`;

  const info = await transporter.sendMail({
    from: `"EVOKE" <${process.env.SENDER_EMAIL}>`,
    to: email,
    subject: "Verify your EVOKE account",
    html: `
      <h2>Welcome to EVOKE</h2>
      <p>Please verify your email:</p>
      <a href="${verificationUrl}">Verify Email</a>
    `,
  });

  console.log("Email sent:", info.messageId);
  console.log("Accepted:", info.accepted);
  console.log("Rejected:", info.rejected);
};