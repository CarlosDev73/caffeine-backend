module.exports = {
  async up(db) {
    console.log('Creating favorites collection...');
    await db.createCollection('favorites', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['userId', 'postId'],
          properties: {
            userId: {
              bsonType: 'objectId',
              description: 'must be a valid ObjectId referencing a user and is required',
            },
            postId: {
              bsonType: 'objectId',
              description: 'must be a valid ObjectId referencing a post and is required',
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
    console.log('Favorites collection created successfully.');
  },

  async down(db) {
    console.log('Dropping favorites collection...');
    await db.collection('favorites').drop();
    console.log('Favorites collection dropped successfully.');
  },
};
