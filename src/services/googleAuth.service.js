const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");
require('dotenv').config();

const sendOTPEmail = async (email, otp) => {
  try {
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      "https://developers.google.com/oauthplayground"
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    const { token } = await oauth2Client.getAccessToken(); 

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL_FROM,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        accessToken: token, 
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Mã OTP đặt lại mật khẩu",
      html: `
        <h1>Đặt lại mật khẩu</h1>
        <p>Mã OTP của bạn là: <strong>${otp}</strong></p>
        <p>Mã có hiệu lực trong 5 phút.</p>
      `,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
module.exports = { sendOTPEmail };