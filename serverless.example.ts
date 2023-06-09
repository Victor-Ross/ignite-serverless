import type { AWS } from '@serverless/typescript';

const serverlessConfiguration: AWS = {
  service: 'ignitecertificate3',
  frameworkVersion: '3',
  plugins: [
    'serverless-esbuild',
    'serverless-dynamodb-local',
    'serverless-iam-roles-per-function',
    'serverless-offline',
  ],
  provider: {
    name: 'aws',
    runtime: 'nodejs16.x',
    region: 'us-east-1',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    },
    // iamRoleStatements: [
    //   {
    //     Effect: 'Allow',
    //     Action: ['dynamodb:*'],
    //     Resource: ['*'],
    //   },
    // ],
  },
  // import the function via paths
  functions: {
    generateCertificate: {
      handler: 'src/functions/generate-certificate.handler',
      events: [
        {
          http: {
            path: '/generateCertificate',
            method: 'post',
            cors: true,
          },
        },
      ],
      // @ts-expect-error: plugin problem with serverless.ts typing
      iamRoleStatements: [
        {
          Effect: 'Allow',
          Action: ['dynamodb:PutItem', 'dynamodb:GetItem'],
          Resource: [
            'arn:aws:dynamodb:us-east-1:412385003078:table/users_certificate',
          ],
        },
      ],
    },
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node16',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
    dynamodb: {
      stages: ['dev', 'local'],
      start: {
        port: 8000,
        inMemory: true,
        migrate: true,
      },
    },
  },
  resources: {
    Resources: {
      dbCertificateUsers: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: 'users_certificate',
          AttributeDefinitions: [
            {
              AttributeName: 'id',
              AttributeType: 'S',
            },
          ],
          KeySchema: [
            {
              AttributeName: 'id',
              KeyType: 'HASH',
            },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 5,
          },
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
