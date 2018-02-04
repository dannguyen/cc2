import fetch from 'node-fetch';
import speech from '@google-cloud/speech';

import db from '../db';

const sc = new speech.v1.SpeechClient();

const saveTranscription = async function saveTranscriptionFunc(prelim, submissionId) {
  await db('submissions').update(submissionId, { transcript: 'Transcription in progress.' });
  console.log('updated db with a prelim');
  const final = await prelim[0].promise();
  const transcript = final[0].results
    .map(result => result.alternatives[0].transcript)
    .join('\n');
  console.log('transcript');
  console.log(transcript);
  await db('submissions').update(submissionId, { transcript });
  console.log('updated db with a final');
};

export default async function transcribeSubmission(req, res) {
  const { submissionId } = req.params;
  console.log(submissionId);
  try {
    const submission = await db('submissions').find(submissionId);
    const audioBinary = await fetch(submission.fields.audio)
      .then(audioRes => audioRes.buffer());
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
    saveTranscription(prelimResult, submissionId);
    res.sendStatus(200);
  } catch (err) { // TK improve error handling
    console.error(err);
    res.sendStatus(500);
  }
}
