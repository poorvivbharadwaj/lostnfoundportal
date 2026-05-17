const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendApprovalEmail = async (to, itemName, type) => {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"Lost & Found Portal" <${process.env.EMAIL_USER}>`,
      to,
      subject: `✅ Your ${type} item report has been approved`,
      html: `
        <div style="font-family: Arial, sans-serif; background: #0f0f1a; color: #fff; padding: 30px; border-radius: 10px;">
          <h1 style="color: #6366f1;">Lost & Found Campus Portal</h1>
          <h2 style="color: #a5b4fc;">Your report has been approved!</h2>
          <p>Your report for <strong style="color: #818cf8;">"${itemName}"</strong> has been approved and is now live on the portal.</p>
          <p style="color: #94a3b8;">If your item is found/matches, we will notify you immediately.</p>
          <hr style="border-color: #2d2d4a;" />
          <p style="color: #64748b; font-size: 12px;">Lost & Found Campus Portal - Helping reunite lost items with their owners.</p>
        </div>
      `
    });
    console.log(`✉️ Approval email sent to ${to}`);
  } catch (err) {
    console.error('Email send error:', err.message);
  }
};

const sendMatchEmail = async (to, lostItemName, foundDescription) => {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"Lost & Found Portal" <${process.env.EMAIL_USER}>`,
      to,
      subject: `🎯 Potential Match Found for "${lostItemName}"`,
      html: `
        <div style="font-family: Arial, sans-serif; background: #0f0f1a; color: #fff; padding: 30px; border-radius: 10px;">
          <h1 style="color: #6366f1;">Lost & Found Campus Portal</h1>
          <h2 style="color: #34d399;">🎯 We found a potential match!</h2>
          <p>Great news! A found item may match your lost item <strong style="color: #818cf8;">"${lostItemName}"</strong>.</p>
          <div style="background: #1e1e3a; padding: 15px; border-radius: 8px; border-left: 4px solid #6366f1;">
            <p><strong>Found Item Description:</strong></p>
            <p style="color: #a5b4fc;">${foundDescription}</p>
          </div>
          <p>Please visit <strong>Room No 405</strong> or contact the campus Lost & Found office to verify and collect your item.</p>
          <p><strong>Contact:</strong> lostfound@college.edu</p>
          <hr style="border-color: #2d2d4a;" />
          <p style="color: #64748b; font-size: 12px;">Lost & Found Campus Portal</p>
        </div>
      `
    });
    console.log(`✉️ Match email sent to ${to}`);
  } catch (err) {
    console.error('Match email send error:', err.message);
  }
};

module.exports = { sendApprovalEmail, sendMatchEmail };
