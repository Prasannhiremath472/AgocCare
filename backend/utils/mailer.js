const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:   process.env.MAIL_HOST || 'smtp.gmail.com',
  port:   parseInt(process.env.MAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

exports.sendOTP = async (email, otp, name = '') => {
  await transporter.sendMail({
    from:    process.env.MAIL_FROM || 'AgocCare <agoccarepvtltd@gmail.com>',
    to:      email,
    subject: 'Your AgocCare Verification OTP',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#f8faff;padding:32px;border-radius:12px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h2 style="color:#044b99;margin:0;">Agoc Care Pvt. Ltd.</h2>
          <p style="color:#079DDF;font-size:12px;margin:4px 0 0;">Empowering Life</p>
        </div>
        <p style="color:#333;font-size:15px;">Hi <strong>${name || email}</strong>,</p>
        <p style="color:#555;font-size:14px;">Use the OTP below to verify your email address. It expires in <strong>10 minutes</strong>.</p>
        <div style="background:#044b99;border-radius:12px;padding:24px;text-align:center;margin:24px 0;">
          <span style="font-size:36px;font-weight:900;letter-spacing:12px;color:#ffffff;">${otp}</span>
        </div>
        <p style="color:#888;font-size:12px;text-align:center;">Do not share this OTP with anyone. If you did not request this, ignore this email.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
        <p style="color:#aaa;font-size:11px;text-align:center;">© ${new Date().getFullYear()} Agoc Care Pvt. Ltd. · Kolhapur, Maharashtra</p>
      </div>
    `,
  });
};
