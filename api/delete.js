const { Resend } = require('resend');
const fetch = require('node-fetch'); // ensure you have node-fetch installed if not in edge function

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const {
    data = [],
    ip: clientIp = 'unknown',
    deviceInfo = 'unknown',
    hostName = 'Unknown'
  } = req.body;

  // Extract IP from header if available (for more accuracy)
  const serverIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || clientIp;

  // Fetch Geo Info
  let geoInfo = {};
  try {
    const geoRes = await fetch(`https://ipapi.co/${serverIp}/json/`);
    geoInfo = await geoRes.json();
  } catch (err) {
    geoInfo = { error: 'Geo lookup failed' };
  }

  const html = `
    <h2>Call Tracker History Deleted</h2>
    <p><strong>Host Name:</strong> ${hostName}</p>
    <p><strong>IP (Client):</strong> ${clientIp}</p>
    <p><strong>IP (Server-detected):</strong> ${serverIp}</p>
    <p><strong>Device:</strong> ${deviceInfo}</p>
    <p><strong>Location:</strong> ${geoInfo.city || 'Unknown'}, ${geoInfo.region || ''}, ${geoInfo.country_name || ''}</p>
    <p><strong>Timezone:</strong> ${geoInfo.timezone || 'Unknown'}</p>
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

    return res.status(200).json({ message: 'History deleted and emailed successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
};