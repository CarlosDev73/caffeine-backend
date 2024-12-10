module.exports = {
  async up(db) {
    console.log('Creating comments collection...');
    await db.createCollection('comments', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['post', 'author', 'content', 'createdAt'],
          properties: {
            post: {
              bsonType: 'objectId',
              description: 'must be a valid ObjectId referencing a post and is required',
            },
            author: {
              bsonType: 'objectId',
              description: 'must be a valid ObjectId referencing a user and is required',
            },
            content: {
              bsonType: 'string',
              description: 'must be a string and is required',
            },
            createdAt: {
              bsonType: 'date',
              description: 'must be a date and is required',
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
