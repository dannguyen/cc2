import express from 'express';
import getProjectNames from './routes/projects';

const app = express();

app.use(express.static('public'));

app.get('/api/projects', getProjectNames);

app.listen(process.env.PORT || 3000, () => {
  console.log('👨‍🏫🎙 I\'m listening.');
});
