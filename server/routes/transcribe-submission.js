import { basename } from 'path';

import speech from '@google-cloud/speech';
import Storage from '@google-cloud/storage';

import db from '../db';

const sc = new speech.v1.SpeechClient();
const storage = new Storage();
const bucket = storage.bucket('call-collect'); // Can't actually use this - need to add random hash TK
let bucketExists = false; // Assume it doesn't until proven.
const createBucket = async function createBucketFunc() {
  try {
    await bucket.create({ storageClass: 'regional', location: 'us-west1' }); // TK customizable
    console.log('created bucket');
    bucketExists = true;
  } catch (err) {
    console.error('Error creating Google Cloud Storage bucket');
    console.error(err);
    console.error('😞');
  }
};
bucket.exists().then((data) => {
  if (data[0]) bucketExists = true;
  else createBucket();
}).catch((err) => {
  console.error('Error checking bucket existence');
  console.error(err);
  console.error('😞');
});

const saveTranscription = async function saveTranscriptionFunc(prelim, submissionId) {
  await db('submissions').update(submissionId, { transcript: 'Transcription in progress.' });
  console.log('updated db with a prelim');
  const final = await prelim[0].promise();
  const transcript = final[0].results
    .map(result => result.alternatives[0].transcript)
    .join(' ');
  console.log('transcript');
  console.log(transcript);
  await db('submissions').update(submissionId, { transcript });
  console.log('updated db with a final');
};

export default async function transcribeSubmission(req, res) {
  const { submissionId } = req.params;
  console.log(submissionId);
  try {
    if (!bucketExists) await createBucket();
    const submission = await db('submissions').find(submissionId);
    await bucket.upload(submission.fields.audio);
    const gcsFilename = basename(submission.fields.audio);

    const prelimResult = await sc.longRunningRecognize({
      config: {
        encoding: 'LINEAR16',
        sampleRateHertz: 8000, // :( Twilio recording limitation
        languageCode: 'en-US', // TK allow other languages
        maxAlternatives: 1, // TK change this?
        profanityFilter: false,
        enableWordTimeOffsets: false, // TK add these
      },
      audio: {
        uri: `gs://call-collect/${gcsFilename}`,
      },
    });
    saveTranscription(prelimResult, submissionId);
    res.sendStatus(200);
  } catch (err) { // TK improve error handling
    console.error(err);
    res.sendStatus(500);
  }
}
