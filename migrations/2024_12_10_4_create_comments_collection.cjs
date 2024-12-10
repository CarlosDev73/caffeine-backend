module.exports = {
  async up(db) {
    console.log('Creating comments collection...');
    await db.createCollection('comments', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['_postId', '_userId', 'content', 'createdAt'],
          properties: {
            _postId: {
              bsonType: 'objectId',
              description: 'must be a valid ObjectId referencing a post and is required',
            },
            _userId: {
              bsonType: 'objectId',
              description: 'must be a valid ObjectId referencing a user and is required',
            },
            _levelId: {
              bsonType: ['objectId', 'null'],
              description: 'must be a valid ObjectId or null if not provided',
            },
            content: {
              bsonType: 'string',
              description: 'must be a string and is required',
            },
            isCorrect: {
              bsonType: 'bool',
              description: 'must be a boolean indicating if the comment is correct',
            },
            likes: {
              bsonType: 'array',
              items: {
                bsonType: 'object',
                properties: {
                  _id: { bsonType: 'objectId', description: 'optional ObjectId for like items' },
                  _userId: {
                    bsonType: 'objectId',
                    description: 'must be a valid ObjectId referencing a user',
                  },
                  createdAt: {
                    bsonType: 'date',
                    description: 'must be a date when the like was created',
                  },
                },
                additionalProperties: false,
              },
              description: 'must be an array of like objects if provided',
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
    console.log('Comments collection created successfully.');
  },

  async down(db) {
    console.log('Dropping comments collection...');
    await db.collection('comments').drop();
    console.log('Comments collection dropped successfully.');
  },
};
