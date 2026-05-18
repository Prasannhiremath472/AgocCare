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

exports.sendOrderNotification = async (adminEmails, order, items, paymentId) => {
  const itemRows = items.map(i =>
    `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${i.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${i.qty}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">₹${parseFloat(i.price).toFixed(2)}</td>
    </tr>`
  ).join('');

  let addr = {};
  try { addr = JSON.parse(order.shipping_address); } catch {}

  await transporter.sendMail({
    from:    process.env.MAIL_FROM || 'AgocCare <agoccarepvtltd@gmail.com>',
    to:      adminEmails.join(', '),
    subject: `🛒 New Order #${order.id} — ₹${parseFloat(order.total).toFixed(2)} | PENDING DISTRIBUTION`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8faff;padding:32px;border-radius:12px;">

        <div style="text-align:center;margin-bottom:24px;">
          <h2 style="color:#044b99;margin:0;">Agoc Care Pvt. Ltd.</h2>
          <p style="color:#079DDF;font-size:12px;margin:4px 0 0;">Empowering Life</p>
        </div>

        <div style="background:#ff6b35;color:white;padding:16px 24px;border-radius:10px;text-align:center;margin-bottom:24px;">
          <h2 style="margin:0;font-size:20px;">⚠️ New Order Pending Distribution</h2>
          <p style="margin:6px 0 0;opacity:0.9;">Order #${order.id} has been paid successfully</p>
        </div>

        <!-- Order Info -->
        <div style="background:white;border-radius:10px;padding:20px;margin-bottom:16px;border:1px solid #e5e7eb;">
          <h3 style="color:#044b99;margin:0 0 12px;">Order Details</h3>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="color:#888;padding:4px 0;">Order ID</td><td style="font-weight:bold;color:#333;">#${order.id}</td></tr>
            <tr><td style="color:#888;padding:4px 0;">Payment ID</td><td style="font-weight:bold;color:#333;">${paymentId}</td></tr>
            <tr><td style="color:#888;padding:4px 0;">Total Amount</td><td style="font-weight:bold;color:#044b99;font-size:18px;">₹${parseFloat(order.total).toFixed(2)}</td></tr>
            <tr><td style="color:#888;padding:4px 0;">Status</td><td><span style="background:#fff3cd;color:#856404;padding:2px 10px;border-radius:20px;font-size:13px;font-weight:bold;">PENDING DISTRIBUTION</span></td></tr>
            <tr><td style="color:#888;padding:4px 0;">Order Date</td><td style="color:#333;">${new Date(order.created_at).toLocaleString('en-IN')}</td></tr>
          </table>
        </div>

        <!-- Customer Info -->
        <div style="background:white;border-radius:10px;padding:20px;margin-bottom:16px;border:1px solid #e5e7eb;">
          <h3 style="color:#044b99;margin:0 0 12px;">Customer Details</h3>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="color:#888;padding:4px 0;">Name</td><td style="color:#333;">${order.customer_name}</td></tr>
            <tr><td style="color:#888;padding:4px 0;">Email</td><td style="color:#333;">${order.customer_email}</td></tr>
            <tr><td style="color:#888;padding:4px 0;">Phone</td><td style="color:#333;">${order.customer_phone || addr.phone || '—'}</td></tr>
            <tr><td style="color:#888;padding:4px 0;">Shipping Address</td><td style="color:#333;">${addr.address || addr.street || ''}, ${addr.city || ''}, ${addr.state || ''} - ${addr.pincode || ''}</td></tr>
          </table>
        </div>

        <!-- Items -->
        <div style="background:white;border-radius:10px;padding:20px;margin-bottom:16px;border:1px solid #e5e7eb;">
          <h3 style="color:#044b99;margin:0 0 12px;">Ordered Products</h3>
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#f0f6ff;">
                <th style="padding:8px 12px;text-align:left;color:#044b99;font-size:13px;">Product</th>
                <th style="padding:8px 12px;text-align:center;color:#044b99;font-size:13px;">Qty</th>
                <th style="padding:8px 12px;text-align:right;color:#044b99;font-size:13px;">Price</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
            <tfoot>
              <tr style="background:#f0f6ff;">
                <td colspan="2" style="padding:10px 12px;font-weight:bold;color:#044b99;">Total</td>
                <td style="padding:10px 12px;font-weight:bold;color:#044b99;text-align:right;">₹${parseFloat(order.total).toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div style="background:#044b99;color:white;padding:16px 24px;border-radius:10px;text-align:center;">
          <p style="margin:0;font-size:14px;">Please process this order for distribution at the earliest.</p>
          <p style="margin:8px 0 0;font-size:12px;opacity:0.8;">Login to Admin Panel to update order status</p>
        </div>

        <p style="color:#aaa;font-size:11px;text-align:center;margin-top:20px;">© ${new Date().getFullYear()} Agoc Care Pvt. Ltd. · Kolhapur, Maharashtra</p>
      </div>
    `,
  });
};

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
