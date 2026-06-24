import transporter from "../config/mailer.js";

export const sendEmail = async ({
  to,
  subject,
  html
}) => {
  const info = await transporter.sendMail({
    from: `MyDay <${process.env.SMTP_USER}>`,
    to,
    subject,
    html
  });

  return info;
};