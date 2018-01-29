import db from '../db';

export default async function getSubmissions(req, res) {
  const { projectName } = req.params;
  try {
    const submissions = await db('submissions').select({
      filterByFormula: `project='${projectName}'`,
      sort: [
        { field: 'prompt', direction: 'asc' },
        { field: 'timestamp', direction: 'asc' },
      ],
    }).all();
    res.json(submissions);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
}
