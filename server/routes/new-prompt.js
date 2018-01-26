import crypto from 'crypto';

import db from '../db';

const randomishString = function randomishStringFunc() {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(24, (err, buf) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(buf.toString('hex'));
    });
  });
};

const tempStore = async function tempStoreFunc(file) {
  const token = await randomishString();
  global.temp[token] = file;
  return token;
};

// express `app` is bound as `this`
// audio blob is available in req.file.buffer
// and we have req.body.projectId, req.body.index
export default async function newPrompt(req, res) {
  const hostname = process.env.NOW_URL || `${req.protocol}://${req.hostname}`;
  const { index, projectId } = req.body;
  const tempToken = await tempStore(req.file);
  try {
    const newPromptRecord = await db('prompts').create({
      index: +index,
      project: [projectId],
      audio: [{ url: `${hostname}/api/temp?token=${tempToken}` }],
    });
    res.send(newPromptRecord);
  } catch (err) {
    res.sendStatus(500);
  }
}
