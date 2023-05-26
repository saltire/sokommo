import { Document, MongoClient } from 'mongodb';


const uri = process.env.MONGODB_URI || '';

let clientPromise: Promise<MongoClient>;

const connectClient = async () => {
  const client = await MongoClient
    .connect(uri)
    .catch(err => {
      console.error('MongoDB connection error:', err);
      throw err;
    });

  process.on('exit', () => {
    console.log('Closing MongoDB connection...');
    client.close(false);
  });

  return client;
};

export const getClient = () => {
  if (!clientPromise) {
    clientPromise = connectClient();
  }
  return clientPromise;
};

export const getCollection = async <T extends Document>(name: string) => (await getClient())
  .db().collection<T>(name);
