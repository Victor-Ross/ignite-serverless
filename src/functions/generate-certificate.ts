import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';
import { PutItemCommand, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { document } from '../lib/dynamodb-client';

type CreateCertificate = {
  id: string;
  name: string;
  grade: string;
};

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
) => {
  const { id, name, grade } = JSON.parse(event.body) as CreateCertificate;

  await document.send(
    new PutItemCommand({
      TableName: 'users_certificate',
      Item: marshall({
        id,
        name,
        grade,
        created_at: new Date().getTime(),
      }),
    })
  );

  const { Item } = await document.send(
    new GetItemCommand({
      TableName: 'users_certificate',
      Key: marshall({
        id,
      }),
      // KeyConditionExpression: 'id = :id',
      // ExpressionAttributeValues: {
      //   ':id': id,
      // },
    })
  );

  return {
    statusCode: 201,
    body: JSON.stringify(unmarshall(Item)),
  };
};
