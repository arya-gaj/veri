import { getDatabase } from './mongodb';

export async function logQuery(queryData: {
  wallet: string;
  question: string;
  parsedQuery: any;
  answer: string;
  proof: any;
  rawJson: any;
  timestamp: Date;
}) {
  try {
    const db = await getDatabase('veriked');
    const collection = db.collection('query_logs');
    
    await collection.insertOne(queryData);
  } catch (error) {
    console.error('Failed to log query:', error);
  }
}

export async function saveQueryHistory(walletAddress: string, query: string, response: any) {
  const db = await getDatabase('veriked');
  const collection = db.collection('query_history');
  
  await collection.insertOne({
    walletAddress,
    query,
    response,
    timestamp: new Date(),
  });
}

export async function getQueryHistory(walletAddress: string, limit = 10) {
  const db = await getDatabase('veriked');
  const collection = db.collection('query_history');
  
  return await collection
    .find({ walletAddress })
    .sort({ timestamp: -1 })
    .limit(limit)
    .toArray();
}

export async function cacheBlockchainData(key: string, data: any, ttl = 3600) {
  const db = await getDatabase('veriked');
  const collection = db.collection('cache');
  
  await collection.updateOne(
    { key },
    {
      $set: {
        data,
        expiresAt: new Date(Date.now() + ttl * 1000),
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );
}

export async function getCachedData(key: string) {
  const db = await getDatabase('veriked');
  const collection = db.collection('cache');
  
  const cached = await collection.findOne({
    key,
    expiresAt: { $gt: new Date() },
  });
  
  return cached?.data || null;
}
