module.exports = {
  async up(db) {
    console.log('Creating action history collection...');
    await db.createCollection('actionhistories', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['userId', 'actionType', 'targetId'],
          properties: {
            userId: {
              bsonType: 'objectId',
              description: 'must be a valid ObjectId referencing a user and is required',
            },
            actionType: {
              bsonType: 'string',
              description: 'must be a string and is required',
            },
            targetId: {
              bsonType: 'objectId',
              description: 'must be a valid ObjectId referencing a user and is required',
            },
            createdAt: {
              bsonType: 'date',
              description: 'timestamp when the comment was created and is required',
            },
            updatedAt: {
              bsonType: 'date',
              description: 'timestamp when the comment was last updated',
            },
          },
        },
      },
    });
    console.log('Action history collection created successfully.');
  },

  async down(db) {
    console.log('Dropping action history collection...');
    await db.collection('actionhistories').drop();
    console.log('Action history collection dropped successfully.');
  },
};
