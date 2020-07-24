module.exports = {
    tables: [
        {
            TableName: `UserScope`,
            AttributeDefinitions: [
                { AttributeName: 'userEmail', AttributeType: 'S'  },
                { AttributeName: 'scopes',    AttributeType: 'NS' }],
            KeySchema: [{ AttributeName: 'userEmail', KeyType: 'HASH' }],
            ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 }
        }

    ],
    port: 8001
};