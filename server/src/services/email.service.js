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
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;

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

  console.log("Verification email sent:", info.messageId);
  console.log("Accepted:", info.accepted);
  console.log("Rejected:", info.rejected);
};

export const sendResetPasswordEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

  const info = await transporter.sendMail({
    from: `"EVOKE" <${process.env.SENDER_EMAIL}>`,
    to: email,
    subject: "Reset your EVOKE password",
    html: `
      <h2>Reset your password</h2>
      <p>You requested a password reset.</p>
      <p>Click the link below to create a new password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link expires in 1 hour.</p>
    `,
  });

  console.log("Reset email sent:", info.messageId);
  console.log("Accepted:", info.accepted);
  console.log("Rejected:", info.rejected);
};