require('dotenv').config({path: '.env'});
const { MongoClient } = require('mongodb');

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('No URI');
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const articles = await db.collection('articles').find({title: { $regex: 'ចុមយក្សហើយ' }}).toArray();
  console.log('Found matching articles:');
  articles.forEach(a => {
    console.log(`- ${a.title} (facebookVideoUrl: ${a.facebookVideoUrl})`);
  });
  await client.close();
}
run();
