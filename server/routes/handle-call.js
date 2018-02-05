import twilio from 'twilio';

import db from '../db';
import transcribe from '../transcribe-submission';

const { VoiceResponse } = twilio.twiml;

const getProjectFromPhone = async function getProjectFromPhoneFunc(phone) {
  try {
    const [project] = await db('projects')
      .select({ filterByFormula: `phone='${phone}'`, maxRecords: 1 })
      .firstPage();
    return project;
  } catch (err) {
    console.error(`Failed to get project from phone ${phone}:`);
    console.error(err);
    console.error('😞');
    return null;
  }
};

// TK Is there a better way to query with filterByFormula???
const getPrompt = async function getPromptFunc(projectId, index) {
  try {
    const prompts = await db('prompts')
      .select({ filterByFormula: `index=${index}` })
      .all();
    return prompts.find(p => p.fields.project[0] === projectId);
  } catch (err) { // not necessarily an error, as we expect this for last segment of call
    console.log(`Failed to get prompt from projectId ${projectId}, index ${index}:`);
    console.log(err);
    console.log('😕');
    return null;
  }
};

// error handling
const saveRecording = async function saveRecordingFunc(caller, audio, projectId, index) {
  const prompt = await getPrompt(projectId, index);
  if (!prompt) {
    console.error('Cannot save recording because no prompt found. Skipping.');
    return;
  }

  try {
    const submission = await db('submissions')
      .create({ audio, caller, prompt: [prompt.id] });
    console.log(`Saved a recording to ${submission.id}.`);
    transcribe(submission.id);
  } catch (err) {
    console.error(`Failed to save recording with caller ${caller}, audio ${audio}, projectId ${projectId}, index ${index}:`);
    console.error(err);
    console.error('😞');
  }
};

const buildVoiceResponse = async function buildVoiceResponseFunc(projectId, index) {
  const vr = new VoiceResponse();
  const prompt = await getPrompt(projectId, index);
  if (!prompt) {
    console.log('No prompt found, so assuming call is done.');
    vr.say('Goodbye!');
  } else {
    const audioUrl = prompt.fields.audio[0].url;
    vr.play(audioUrl);
    vr.record({
      action: `/api/call/${index + 1}`,
      method: 'POST',
      timeout: 10,
      finishOnKey: '#',
      maxLength: 300,
      playBeep: true,
      trim: 'do-not-trim',
    });
  }
  return vr.toString();
};

export default async function handleCall(req, res) {
  const index = +req.params.index;
  const { To, From, RecordingUrl } = req.body; // More here, e.g. geo, recording duration TK
  const project = await getProjectFromPhone(To);
  if (!project) {
    res.sendStatus(500);
    return;
  }

  if (RecordingUrl) saveRecording(From, RecordingUrl, project.id, index - 1);

  const vrString = await buildVoiceResponse(project.id, index);
  res.send(vrString);
}
