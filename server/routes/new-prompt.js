import db from '../db';

// audio has been saved to req.file.path
// and we have req.body.projectId, req.body.index
export default async function newPrompt(req, res) {
  const hostname = process.env.NOW_URL || `${req.protocol}://${req.hostname}`;
  const { index, projectId } = req.body;
  const filePath = encodeURIComponent(req.file.path);
  const fileMime = encodeURIComponent(req.file.mimetype);
  try {
    const newPromptRecord = await db('prompts').create({
      index: +index,
      project: [projectId],
      audio: [{ url: `${hostname}/api/temp?filepath=${filePath}&mimetype=${fileMime}` }],
    });
    res.send(newPromptRecord);
  } catch (err) {
    res.sendStatus(500);
  }
}
