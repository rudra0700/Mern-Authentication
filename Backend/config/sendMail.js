import { createTransport } from "nodemailer";

const sendEmail = async ({ email, subject, html }) => {
  const transport = createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

    await transport.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: subject,
    html: html,
  });
};

export default sendEmail;
