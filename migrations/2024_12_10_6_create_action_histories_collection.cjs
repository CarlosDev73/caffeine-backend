module.exports = {
  async up(db) {
    console.log('Creating action history collection...');
    await db.createCollection('actionhistories', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['user', 'action', 'timestamp'],
          properties: {
            user: {
              bsonType: 'objectId',
              description: 'must be a valid ObjectId referencing a user and is required',
            },
            action: {
              bsonType: 'string',
              description: 'must be a string and is required',
            },
            timestamp: {
              bsonType: 'date',
              description: 'must be a date and is required',
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
