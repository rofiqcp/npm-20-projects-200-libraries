const pool = require('../db');
const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (!transporter && process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

async function sendAlertEmail(subject, message) {
  const t = getTransporter();
  if (!t || !process.env.ALERT_EMAIL) return;

  try {
    await t.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.ALERT_EMAIL,
      subject: `[IoT Alert] ${subject}`,
      text: message,
      html: `<p>${message}</p><p><small>Sent by IoT Dashboard</small></p>`,
    });
  } catch (err) {
    console.error('Email send error:', err.message);
  }
}

async function checkThresholds(reading, sensor) {
  const alerts = [];

  if (reading.temperature > sensor.temp_max_alert) {
    alerts.push({
      type: 'temp_high',
      message: `Temperature too high on ${sensor.name}: ${reading.temperature}°C (max: ${sensor.temp_max_alert}°C)`,
      value: reading.temperature,
      threshold: sensor.temp_max_alert,
    });
  }

  if (reading.temperature < sensor.temp_min_alert) {
    alerts.push({
      type: 'temp_low',
      message: `Temperature too low on ${sensor.name}: ${reading.temperature}°C (min: ${sensor.temp_min_alert}°C)`,
      value: reading.temperature,
      threshold: sensor.temp_min_alert,
    });
  }

  if (reading.humidity > sensor.humidity_max_alert) {
    alerts.push({
      type: 'humidity_high',
      message: `Humidity too high on ${sensor.name}: ${reading.humidity}% (max: ${sensor.humidity_max_alert}%)`,
      value: reading.humidity,
      threshold: sensor.humidity_max_alert,
    });
  }

  for (const alert of alerts) {
    try {
      await pool.query(
        'INSERT INTO alerts (sensor_id, type, message, value, threshold) VALUES ($1, $2, $3, $4, $5)',
        [sensor.id, alert.type, alert.message, alert.value, alert.threshold]
      );
      await sendAlertEmail(alert.type, alert.message);
    } catch (err) {
      console.error('Alert insert error:', err.message);
    }
  }

  return alerts;
}

module.exports = { checkThresholds };
