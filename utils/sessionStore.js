const redis = require("redis");
const client = redis.createClient();

client.connect();

const EXPIRY = 180; // seconds

async function setSession(sessionId, data) {
  await client.setEx(`qr:${sessionId}`, EXPIRY, JSON.stringify(data));
}

async function getSession(sessionId) {
  const data = await client.get(`qr:${sessionId}`);
  return data ? JSON.parse(data) : null;
}

module.exports = { setSession, getSession };
