import dotenv from 'dotenv/config';
import nodemailer from 'nodemailer';
const project_name = ` Smart Shared Transport Management System `;


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Function to send email
export const sendEmail = async (to, subject, text, html) => {
    try {
    const info = await transporter.sendMail({
        from: `" ${project_name} " <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
      console.error('Error sending email:', error);
    }
};

export const sendRegistrationEmail = async function(userEmail, userName){
  const subject = `Welcome to ${project_name}!`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #222;">
      <h2 style="margin-bottom: 8px;">Hello ${userName},</h2>
      <p style="margin: 0 0 10px 0;">
        Thanks for joining <strong> ${project_name} </strong>.
      </p>
      <p style="margin: 0 0 10px 0;">
        You can now securely track and manage all your transactions in one place.
        </p>
      <p style="margin: 18px 0 0 0;">
        Best regards,<br/>
        <strong>The ${project_name} Team.</strong>
      </p>
    </div>
  `;
  const text = `
  Hello Sri/Srimati ${userName},

  Thank you for registering at ${project_name}.
  You can now securely track and manage all your transactions in one place.

  Best regards,
  ${project_name} Team.
  (Registered email: ${userEmail})
  `;
  await sendEmail(userEmail, subject, text, html);
}

export async function sendEmailFnx(email, otp) {
  const subject = `Your OTP for ${project_name}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #222;">
      <h2 style="margin-bottom: 8px;">OTP Verification</h2>
      <p style="margin: 0 0 10px 0;">
        Your one-time password (OTP) for <strong>${project_name}</strong> is:
      </p>
      <div style="font-size: 24px; font-weight: bold; letter-spacing: 4px; margin: 16px 0; color: #0b5ed7;">
        ${otp}
      </div>
      <p style="margin: 0 0 10px 0;">
        This OTP is valid for a short time and should not be shared with anyone.
      </p>
      <p style="margin: 18px 0 0 0;">
        Best regards,<br/>
        <strong>The ${project_name} Team.</strong>
      </p>
    </div>
  `;

  const text = `
  Hello,

  Your OTP for ${project_name} is: ${otp}

  This OTP is valid for a short time and should not be shared with anyone.

  Best regards,
  ${project_name} Team.
  `;

  await sendEmail(email, subject, text, html);
}