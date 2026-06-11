require('dotenv').config({path: '.env'});
const { MongoClient } = require('mongodb');

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const articles = await client.db().collection('articles').find({ facebookVideoUrl: { $regex: 'share/v' } }).toArray();
  
  let fixedCount = 0;
  for (const article of articles) {
    const fbRes = await fetch(article.facebookVideoUrl, {
      headers: { 'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)' }
    });
    const finalUrl = fbRes.url;
    let videoId = null;
    const reelMatch = finalUrl.match(/\/reel\/(\d+)/);
    const videoMatch = finalUrl.match(/\/videos\/(\d+)/);
    const watchMatch = finalUrl.match(/v=(\d+)/);
    if (reelMatch) videoId = reelMatch[1];
    else if (videoMatch) videoId = videoMatch[1];
    else if (watchMatch) videoId = watchMatch[1];
    
    if (videoId) {
      await client.db().collection('articles').updateOne(
        { _id: article._id },
        { $set: { facebookVideoUrl: `https://www.facebook.com/watch/?v=${videoId}` } }
      );
      fixedCount++;
    }
  }
  
  console.log('Fixed DB dynamically:', fixedCount);
  await client.close();
}
run();
