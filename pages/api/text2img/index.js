const axios = require('axios');
const fs = require('fs');

export default async function handler(req, res) {
  console.log(req.body);

  let image;
  if (process.env.KALOS_API) {
    image = await axios.post(process.env.KALOS_API, req.body, {
      responseType: 'arraybuffer',
      headers: {
        "Content-Type": "application/json",
      },
    });
  } else {
    image = await axios.get('https://feed.base.one/api/images/profiles/0x02d776B7b6614451379352d789846825e722930E?1681608225163', { responseType: 'arraybuffer' });
  }

  if (!fs.existsSync(process.env.IMAGE_DIR)) {
    fs.mkdirSync(process.env.IMAGE_DIR);
  }

  const imageFileName = `${Date.now()}.jpg`;
  const imageBuffer = await Buffer.from(image.data);
  await fs.promises.writeFile(`${process.env.IMAGE_DIR}/${imageFileName}`, imageBuffer);

  res.end(JSON.stringify({ imageFileName }));
}
