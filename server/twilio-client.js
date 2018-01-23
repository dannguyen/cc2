import twilio from 'twilio';

if (process.env.TWILIO_ACCOUNT_SID === undefined) {
  throw new Error('Missing environment variable: TWILIO_ACCOUNT_SID');
}
if (process.env.TWILIO_AUTH_TOKEN === undefined) {
  throw new Error('Missing environment variable: TWILIO_AUTH_TOKEN');
}

export default twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);
