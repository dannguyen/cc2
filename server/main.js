import express from 'express';

const app = express();

app.use(express.static('public'));

app.get('/api/test', (req, res) => {
  res.send('susjjsp');
  console.log('yo');
});

app.listen(process.env.PORT || 3000, () => {
  console.log('👨‍🏫 I\'m listening.');
});
