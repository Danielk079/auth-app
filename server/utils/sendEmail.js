const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTPEmail = async (email, otp, type) => {
  const subjects = {
    verify: 'Verify Your Email — Auth App',
    login: 'Your Login OTP — Auth App',
    reset: 'Reset Your Password — Auth App',
    change: 'Change Password OTP — Auth App',
  };

  const titles = {
    verify: 'Verify Your Email',
    login: 'Confirm Your Login',
    reset: 'Reset Your Password',
    change: 'Change Your Password',
  };

  const messages = {
    verify: 'Please use the OTP below to verify your email address and activate your account.',
    login: 'Please use the OTP below to confirm your login.',
    reset: 'Please use the OTP below to reset your password.',
    change: 'Please use the OTP below to change your password.',
  };

  const mailOptions = {
    from: `"Auth App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: subjects[type],
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:40px;text-align:center;">
                      <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:bold;">🔐 Auth App</h1>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:40px;">
                      <h2 style="color:#333333;margin:0 0 16px 0;font-size:22px;">
                        ${titles[type]}
                      </h2>
                      <p style="color:#666666;font-size:16px;line-height:1.6;margin:0 0 32px 0;">
                        ${messages[type]}
                      </p>

                      <!-- OTP Box -->
                      <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:12px;padding:32px;text-align:center;margin:0 0 32px 0;">
                        <p style="color:rgba(255,255,255,0.8);font-size:14px;margin:0 0 8px 0;letter-spacing:2px;text-transform:uppercase;">
                          Your OTP Code
                        </p>
                        <h1 style="color:#ffffff;font-size:48px;font-weight:bold;margin:0;letter-spacing:12px;">
                          ${otp}
                        </h1>
                      </div>

                      <!-- Expiry warning -->
                      <div style="background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:16px;margin:0 0 32px 0;">
                        <p style="color:#856404;font-size:14px;margin:0;">
                          ⏰ This OTP expires in <strong>10 minutes</strong>. Do not share it with anyone.
                        </p>
                      </div>

                      <p style="color:#999999;font-size:14px;line-height:1.6;margin:0;">
                        If you didn't request this, please ignore this email or contact support if you have concerns.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background:#f8f9fa;padding:24px;text-align:center;border-top:1px solid #eeeeee;">
                      <p style="color:#999999;font-size:12px;margin:0;">
                        © 2026 Auth App. All rights reserved.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendOTPEmail;