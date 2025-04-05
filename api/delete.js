const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const {
    data = [],
    ip = 'unknown',
    deviceInfo = 'unknown',
    hostName = 'Unknown'
  } = req.body;

  const html = `
    <h2>Call Tracker History Deleted</h2>
    <p><strong>Host Name:</strong> ${hostName}</p>
    <p><strong>IP:</strong> ${ip}</p>
    <p><strong>Device:</strong> ${deviceInfo}</p>
    <hr>
    <pre style="font-size: 14px; background: #f4f4f4; padding: 10px; border-radius: 8px;">
${JSON.stringify(data, null, 2)}
    </pre>
  `;

  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'livuapp900@gmail.com',
      subject: 'Deleted History Report',
      html
    });

    return res.status(200).json({ message: 'History deleted successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ message: 'Failed to delete history', error: error.message });
  }
};
