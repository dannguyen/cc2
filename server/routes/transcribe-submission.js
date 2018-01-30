import fetch from 'node-fetch';
import speech from '@google-cloud/speech';

import db from '../db';

if (process.env.GCLOUD_PROJECT_ID === undefined) {
  throw new Error('Missing environment variable: GCLOUD_PROJECT_ID');
}
if (process.env.GCLOUD_API_KEY === undefined) {
  throw new Error('Missing environment variable: GCLOUD_API_KEY');
}
const sc = new speech.v1.SpeechClient({
  // projectId: process.env.GCLOUD_PROJECT_ID,
  // key: process.env.GCLOUD_API_KEY,
});
console.log('gonna get the proj id');
sc.getProjectId((err, str) => {
  console.log('sc proj id');
  console.log(err);
  console.log(str);
});

const saveTranscription = async function saveTranscriptionFunc(prelim) {
  const final = await prelim[0].promise();
  console.log('got final');
  const transcription = final[0].results
    .map(result => result.alternatives[0].transcript)
    .join('\n');
  console.log(`Transcription: ${transcription}`);
};

export default async function transcribeSubmission(req, res) {
  const { submissionId } = req.params;
  try {
    const submission = await db('submissions').find(submissionId);
    console.log(submission.fields.audio);
    const audioBinary = await fetch(submission.fields.audio)
      .then(audioRes => audioRes.buffer());
    console.log('downloaded audio');
    const prelimResult = await sc.longRunningRecognize({
      config: {
        encoding: 'LINEAR16',
        sampleRateHertz: 8000, // :( Twilio recording limitation
        languageCode: 'en-US', // TK allow other languages
        maxAlternatives: 1, // TK change this?
        profanityFilter: false,
        enableWordTimeOffsets: false,
      },
      audio: {
        content: audioBinary.toString('base64'),
      },
    });
    console.log('started speech recognition:');
    console.log(prelimResult);
    saveTranscription(prelimResult);
    res.sendStatus(200);
  } catch (err) {
    console.log('boo');
    console.error(err);
    res.sendStatus(500);
  }
}
