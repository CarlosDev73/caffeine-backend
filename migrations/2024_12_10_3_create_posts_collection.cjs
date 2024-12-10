module.exports = {
  async up(db) {
    console.log('Creating posts collection...');
    await db.createCollection('posts', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['title', 'content', 'author', 'createdAt'],
          properties: {
            title: {
              bsonType: 'string',
              description: 'must be a string and is required',
            },
            content: {
              bsonType: 'string',
              description: 'must be a string and is required',
            },
            author: {
              bsonType: 'objectId',
              description: 'must be a valid ObjectId and is required',
            },
            createdAt: {
              bsonType: 'date',
              description: 'must be a date and is required',
            },
          },
        },
      },
    });
    console.log('Posts collection created successfully.');
  },

  async down(db) {
    console.log('Dropping posts collection...');
    await db.collection('posts').drop();
    console.log('Posts collection dropped successfully.');
  },
};
