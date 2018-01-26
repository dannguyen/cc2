import fs from 'fs';

// TK make this more secure (user can traverse/delete filesystem ?!)
export default function tempServe(req, res) {
  const { filepath, mimetype } = req.query;
  res.sendFile(filepath, { headers: { 'Content-Type': mimetype } }, (err) => {
    if (err) {
      console.error(`Error sending file at ${filepath}`);
      console.error(err);
      console.error('😞');
      return;
    }
    fs.unlink(filepath, (err2) => {
      if (err2) {
        console.error(`Error unlinking file at ${filepath}`);
        console.error(err2);
        console.error('😞');
      }
      console.log(`Sent and unlinked file from ${filepath}`);
    });
  });
}
