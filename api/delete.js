const { Resend } = require('resend');
const fetch = require('node-fetch');
const UAParser = require('ua-parser-js');

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const {
      data = [],
      ip: clientIp = 'unknown',
      deviceInfo = 'unknown',
      hostName = 'Unknown',
    } = req.body;

    const serverIp =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() || clientIp;

    const parser = new UAParser(deviceInfo);
    const parsed = parser.getResult();

    const os = `${parsed.os?.name || 'Unknown'} ${parsed.os?.version || ''}`.trim();
    const browser = `${parsed.browser?.name || 'Unknown'} ${parsed.browser?.version || ''}`.trim();
    const device = parsed.device?.model || 'Unknown';

    let geo = {
      city: 'N/A',
      region: 'N/A',
      country_name: 'N/A',
      timezone: 'N/A'
    };

    try {
      const geoRes = await fetch(`https://ipapi.co/${serverIp}/json/`);
      geo = await geoRes.json();
    } catch (err) {
      console.warn('Geolocation fetch failed:', err);
    }

    const html = `
      <h2>Call Tracker History Deleted</h2>
      <p><strong>Host Name:</strong> ${hostName}</p>
      <p><strong>IP (Client):</strong> ${clientIp}</p>
      <p><strong>IP (Detected):</strong> ${serverIp}</p>
      <p><strong>Device Model:</strong> ${device}</p>
      <p><strong>Operating System:</strong> ${os}</p>
      <p><strong>Browser:</strong> ${browser}</p>
      <p><strong>Raw User Agent:</strong> ${deviceInfo}</p>
      <p><strong>Location:</strong> ${geo.city}, ${geo.region}, ${geo.country_name}</p>
      <p><strong>Timezone:</strong> ${geo.timezone}</p>
      <hr>
      <pre style="font-size: 14px; background: #f4f4f4; padding: 10px; border-radius: 8px;">
${JSON.stringify(data, null, 2)}
      </pre>
    `;

    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'livuapp900@gmail.com',
      subject: 'Deleted History Report',
      html,
    });

    return res.status(200).json({ message: 'History deleted and emailed successfully!' });

  } catch (error) {
    console.error('DELETE API ERROR:', error);
    return res.status(500).json({
      message: 'Server error occurred',
      error: error.message || 'Unknown error',
    });
  }
};