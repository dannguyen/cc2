import { randomBytes } from 'crypto';
import { basename } from 'path';

import speech from '@google-cloud/speech';
import Storage from '@google-cloud/storage';

import db from './db';

const createBucket = async function createBucketFunc(storage) {
  const name = `call-collect-${randomBytes(16).toString('hex')}`;
  const bucket = storage.bucket(name);
  await bucket.create({ storageClass: 'regional', location: 'us-west1' }); // TK customizable
  console.log(`created bucket ${name}`);
  return bucket;
};

const getBucket = async function getBucketFunc(storage) {
  try {
    const [buckets] = await storage.getBuckets();
    console.log('here are the buckets', buckets.map(b => b.name));
    return buckets.find(b => b.name.startsWith('call-collect')) || createBucket(storage);
  } catch (err) {
    console.error('Error getting or creating Google Cloud Storage bucket');
    console.error(err);
    console.error('😞');
    return null;
  }
};

let transcribe;

if (process.env.GOOGLE_CREDS_STRING === undefined) {
  console.log('No GOOGLE_CREDS_STRING found, disabling transcription.');
  transcribe = function transcribeNoop() {
  };
} else {
  const credentials = JSON.parse(process.env.GOOGLE_CREDS_STRING);
  const sc = new speech.v1.SpeechClient({ credentials });
  const storage = new Storage({ credentials });
  const bucketPromise = getBucket(storage);

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

  transcribe = async function transcribeSubmission(submissionId) {
    console.log(submissionId);
    try {
      const bucket = await bucketPromise; // should be resolved by now, probably
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
          uri: `gs://${bucket.name}/${gcsFilename}`,
        },
      });
      saveTranscription(prelimResult, submissionId);
    } catch (err) { // TK improve error handling
      console.error(err);
    }
  };
}

export default function transcribeWrapper(submissionId) {
  transcribe(submissionId);
}
