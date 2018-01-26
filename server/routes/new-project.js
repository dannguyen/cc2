import db from '../db';
import twilioClient from '../twilio-client';

const newPhoneNumber = async function newPhoneNumberFunc(name, hostname) {
  // TK add error handling and more customization
  try {
    const { phoneNumber } = await twilioClient.incomingPhoneNumbers.create({
      friendlyName: name,
      areaCode: '415',
      voiceUrl: `${hostname}/api/call/0`,
      voiceMethod: 'POST',
      voiceCallerIdLookup: false, // For now to save 1 cent per call (TK)
      apiVersion: '2010-04-01',
    });
    return phoneNumber;
  } catch (err) {
    return '+777';
  }
};

export default async function newProject(req, res) {
  // error handling TK
  const hostname = process.env.NOW_URL || `${req.protocol}://${req.hostname}`;
  const { name } = req.body;
  const phone = await newPhoneNumber(name, hostname);
  try {
    const newProjectRecord = await db('projects').create({ name, phone });
    res.send(newProjectRecord);
  } catch (err) {
    res.sendStatus(500);
  }
}
