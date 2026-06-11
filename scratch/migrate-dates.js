const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db(process.env.DB_NAME || 'kpop_news');
    const articles = db.collection('articles');

    // Find all articles where createdAt is a string
    const stringDates = await articles.find({ createdAt: { $type: "string" } }).toArray();
    console.log(`Found ${stringDates.length} articles with string dates.`);

    let updated = 0;
    for (const article of stringDates) {
      const properDate = new Date(article.createdAt);
      await articles.updateOne(
        { _id: article._id },
        { $set: { createdAt: properDate } }
      );
      updated++;
    }

    console.log(`Successfully migrated ${updated} articles to native Date objects!`);
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
