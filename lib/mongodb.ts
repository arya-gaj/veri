import { MongoClient, ServerApiVersion, Db } from 'mongodb';

const isBuild = process.env.NEXT_PHASE === 'phase-production-build';
const mockClient = {
  db: () => ({
    collection: () => ({
      insertOne: async () => ({ acknowledged: true }),
      find: () => ({ toArray: async () => [] }),
    }),
  }),
} as unknown as MongoClient;

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (isBuild || !process.env.MONGODB_URI) {
  clientPromise = Promise.resolve(mockClient);
} else {
  const uri = process.env.MONGODB_URI;
  const options = {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    maxPoolSize: 10,
    minPoolSize: 2,
    maxIdleTimeMS: 30000,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 10000,
  };

  if (process.env.NODE_ENV === 'development') {
    let globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
}

export default clientPromise;

export async function getDatabase(dbName: string = 'veriked'): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}

export async function testConnection() {
  try {
    const client = await clientPromise;
    await client.db('admin').command({ ping: 1 });
    return true;
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    return false;
  }
}
