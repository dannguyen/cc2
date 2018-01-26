global.temp = {};

export default function tempServe(req, res) {
  const { token } = req.query;
  const file = global.temp[token];
  delete global.temp[token];
  res.set('Content-Type', file.mimetype);
  res.send(file.buffer);
}
