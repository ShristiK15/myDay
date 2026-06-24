import transporter from "../config/mailer.js";

export const sendEmail = async ({
    email,
    subject,
    message
}) => {

    const info = await transporter.sendMail({
        from: `MyDay <${process.env.SMTP_USER}>`,
        to: email,
        subject,
        html: message
    });

    return info;
};