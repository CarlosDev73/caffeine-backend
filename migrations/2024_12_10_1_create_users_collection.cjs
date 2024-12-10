module.exports = {
  async up(db) {
    console.log('Creating users collection...');
    await db.createCollection('users', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['userName', 'email', 'password', 'displayName'],
          properties: {
            userName: { 
              bsonType: 'string', 
              description: 'must be a string and is required',
              maxLength: 60,
            },
            displayName: { 
              bsonType: 'string', 
              description: 'must be a string and is required',
              minLength: 1,
              maxLength: 20,
            },
            email: { 
              bsonType: 'string', 
              description: 'must be a string and is required' 
            },
            password: { 
              bsonType: 'string', 
              description: 'must be a string and is required' 
            },
            points: { 
              bsonType: 'number', 
              minimum: 0, 
              description: 'must be a non-negative number' 
            },
            level: { 
              bsonType: ['objectId', 'null'], 
              description: 'must be a valid ObjectId or null if not provided' 
            },
            phone: { 
              bsonType: ['string', 'null'], 
              description: 'must be a string if provided' 
            },
            country: { 
              bsonType: ['string', 'null'], 
              description: 'must be a string if provided' 
            },
            skills: { 
              bsonType: ['array'], 
              items: { bsonType: 'string' },
              description: 'must be an array of strings' 
            },
            biography: { 
              bsonType: ['string', 'null'], 
              description: 'must be a string if provided' 
            },
            followers: { 
              bsonType: ['array'], 
              items: { bsonType: 'string' },
              description: 'must be an array of strings' 
            },
            following: { 
              bsonType: ['array'], 
              items: { bsonType: 'string' },
              description: 'must be an array of strings' 
            },
            profileImg: {
              bsonType: 'object',
              properties: {
                public_id: { bsonType: ['string', 'null'], description: 'must be a string' },
                secure_url: { bsonType: ['string', 'null'], description: 'must be a string' },
              },
              additionalProperties: false,
            },
            coverImg: { 
              bsonType: ['string', 'null'], 
              description: 'must be a string if provided' 
            },
            resetPasswordToken: { 
              bsonType: ['string', 'null'], 
              description: 'must be a string if provided' 
            },
            resetPasswordExpires: { 
              bsonType: ['date', 'null'], 
              description: 'must be a date if provided' 
            },
            createdAt: { 
              bsonType: 'date', 
              description: 'timestamp when the document was created' 
            },
            updatedAt: { 
              bsonType: 'date', 
              description: 'timestamp when the document was last updated' 
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
