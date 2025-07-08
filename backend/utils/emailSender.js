const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,        // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

exports.sendEmail = async ({ to, subject, html }) => {
  const mailOpts = {
    from: `"Delivery Service" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html
  };
  return transporter.sendMail(mailOpts);
};
