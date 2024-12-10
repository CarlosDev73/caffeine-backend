module.exports = {
  async up(db) {
    console.log('Creating levels collection...');
    await db.createCollection('levels', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['name', 'description', 'requirements'],
          properties: {
            name: {
              bsonType: 'string',
              description: 'must be a string and is required',
            },
            description: {
              bsonType: 'string',
              description: 'must be a string and is required',
            },
            requirements: {
              bsonType: 'int',
              description: 'must be an integer and is required',
            },
          },
        },
      },
    });
    console.log('Levels collection created successfully.');
  },

  async down(db) {
    console.log('Dropping levels collection...');
    await db.collection('levels').drop();
    console.log('Levels collection dropped successfully.');
  },
};
