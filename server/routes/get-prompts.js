import db from '../db';

export default async function getPrompts(req, res) {
  const { projectName } = req.params;
  try {
    const prompts = await db('prompts').select({
      filterByFormula: `project='${projectName}'`,
      sort: [{ field: 'index', direction: 'asc' }],
    }).all();
    res.json(prompts);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
}
