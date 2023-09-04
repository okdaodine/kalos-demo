const fs = require('fs');

export default async function handler(req, res) {
  const imageBuffer = await fs.promises.readFile(`${process.env.IMAGE_DIR}/${req.query.id}`);
  res.statusCode = 200;
  res.setHeader('Content-Type', 'image/jpeg');
  res.setHeader('Cache-Control', 'public, max-age=31557600');
  res.send(imageBuffer);
}
