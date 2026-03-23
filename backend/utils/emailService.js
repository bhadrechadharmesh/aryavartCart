const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT, 10) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send an email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - Email body (HTML)
 */
const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"DropShip Store" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`📧 Email sent to ${to}`);
  } catch (error) {
    console.error(`❌ Email error: ${error.message}`);
  }
};

const sendOrderConfirmation = async (order, email) => {
  const itemsList = order.orderItems
    .map((i) => `<li>${i.name} × ${i.quantity} — $${i.price.toFixed(2)}</li>`)
    .join('');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
      <h2 style="color:#6C63FF">Order Confirmed! 🎉</h2>
      <p>Thank you for your order <strong>#${order._id}</strong>.</p>
      <h3>Items</h3>
      <ul>${itemsList}</ul>
      <p><strong>Total: $${order.totalPrice.toFixed(2)}</strong></p>
      <p>Status: <em>${order.orderStatus}</em></p>
      <hr/>
      <p style="color:#888;font-size:12px">DropShip Store — This is an automated email.</p>
    </div>
  `;
  await sendEmail(email, `Order Confirmation #${order._id}`, html);
};

const sendShippingUpdate = async (order, email, trackingNumber) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
      <h2 style="color:#6C63FF">Your Order Has Shipped! 📦</h2>
      <p>Order <strong>#${order._id}</strong> is on its way.</p>
      ${trackingNumber ? `<p>Tracking: <strong>${trackingNumber}</strong></p>` : ''}
      <hr/>
      <p style="color:#888;font-size:12px">DropShip Store — This is an automated email.</p>
    </div>
  `;
  await sendEmail(email, `Shipping Update — Order #${order._id}`, html);
};

const sendPaymentConfirmation = async (order, email) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
      <h2 style="color:#6C63FF">Payment Received ✅</h2>
      <p>We received your payment of <strong>$${order.totalPrice.toFixed(2)}</strong> for order <strong>#${order._id}</strong>.</p>
      <hr/>
      <p style="color:#888;font-size:12px">DropShip Store — This is an automated email.</p>
    </div>
  `;
  await sendEmail(email, `Payment Confirmation — Order #${order._id}`, html);
};

module.exports = {
  sendEmail,
  sendOrderConfirmation,
  sendShippingUpdate,
  sendPaymentConfirmation,
};
