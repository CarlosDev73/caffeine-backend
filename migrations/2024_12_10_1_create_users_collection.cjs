module.exports = {
  async up(db) {
    console.log('Creating users collection...');
    await db.createCollection('users', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['username', 'email', 'password', 'points'],
          properties: {
            username: {
              bsonType: 'string',
              description: 'must be a string and is required',
            },
            email: {
              bsonType: 'string',
              description: 'must be a string and is required',
            },
            password: {
              bsonType: 'string',
              description: 'must be a string and is required',
            },
            points: {
              bsonType: 'int',
              description: 'must be an integer and is required',
            },
          },
        },
      },
    });
    console.log('Users collection created successfully.');
  },

  async down(db) {
    console.log('Dropping users collection...');
    await db.collection('users').drop();
    console.log('Users collection dropped successfully.');
  },
};
