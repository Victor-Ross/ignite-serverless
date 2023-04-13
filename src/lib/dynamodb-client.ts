import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';

const options: DynamoDBClientConfig = {
  region: 'localhost',
  endpoint: 'http://localhost:8000',
};

const isOffline = () => {
  return process.env.IS_OFFLINE;
};

export const document = isOffline()
  ? new DynamoDBClient(options)
  : new DynamoDBClient({});
