import crypto from 'crypto';

import removeRoute from 'express-remove-route';

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

const tempServe = async function tempServeFunc(app, file) {
  const tempUrl = await randomishString();
  app.get(`/temp/${tempUrl}`, (req, res) => {
    res.set('Content-Type', file.mimetype);
    res.send(file.buffer);
  });
  return tempUrl;
};

// express `app` is bound as `this`
// audio blob is available in req.file.buffer
// and we have req.body.projectId, req.body.index
export default async function newPrompt(req, res) {
  const hostname = process.env.NOW_URL || `${req.protocol}://${req.hostname}`;
  const { index, projectId } = req.body;
  const tempUrl = await tempServe(this, req.file);
  try {
    const newPromptRecord = await db('prompts').create({
      index: +index,
      project: [projectId],
      audio: [{ url: `${hostname}/temp/${tempUrl}` }],
    });
    removeRoute(this, `/temp/${tempUrl}`); // garbage cleans? TK check - doesn't seem to work...
    res.send(newPromptRecord);
  } catch (err) {
    res.sendStatus(500);
  }
}
