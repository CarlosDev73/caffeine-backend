module.exports = {
  async up(db) {
    console.log('Creating favorites collection...');
    await db.createCollection('favorites', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['user', 'post'],
          properties: {
            user: {
              bsonType: 'objectId',
              description: 'must be a valid ObjectId referencing a user and is required',
            },
            post: {
              bsonType: 'objectId',
              description: 'must be a valid ObjectId referencing a post and is required',
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
