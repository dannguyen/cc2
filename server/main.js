import express from 'express';
import multer from 'multer';

import getProjectNames from './routes/projects';
import newProject from './routes/new-project';
import newPrompt from './routes/new-prompt';
import handleCall from './routes/handle-call';
import tempServe from './routes/temp-serve';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.static('public'));
app.get('/api/projects', getProjectNames);
app.post('/api/projects', express.json(), newProject);
app.post('/api/prompts', upload.single('promptAudio'), newPrompt);
app.post('/api/call/:index', express.urlencoded({ extended: true }), handleCall);
app.get('/api/temp', tempServe);

app.listen(process.env.PORT || 3000, () => {
  console.log('👨‍🏫🎙 I\'m listening.');
});
