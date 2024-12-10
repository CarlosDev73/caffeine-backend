module.exports = {
  async up(db) {
    console.log('Creating posts collection...');
    await db.createCollection('posts', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['title', 'content', '_userId', 'type', 'createdAt'],
          properties: {
            _userId: { 
              bsonType: 'objectId', 
              description: 'must be a valid ObjectId and is required',
            },
            title: {
              bsonType: 'string',
              description: 'must be a string and is required',
              maxLength: 120,
            },
            content: {
              bsonType: 'string',
              description: 'must be a string and is required',
            },
            tags: {
              bsonType: 'array',
              items: { 
                bsonType: 'string',
                description: 'must be a string',
                maxLength: 60,
              },
              description: 'must be an array of strings if provided',
            },
            category: {
              bsonType: 'array',
              items: { 
                bsonType: 'string',
                description: 'must be a string',
                maxLength: 60,
              },
              description: 'must be an array of strings if provided',
            },
            type: {
              bsonType: 'string',
              enum: ['post', 'issue'],
              description: 'must be a string with either "post" or "issue" and is required',
            },
            media: {
              bsonType: 'array',
              items: {
                bsonType: 'object',
                properties: {
                  public_id: { bsonType: ['string', 'null'], description: 'must be a string if provided' },
                  secure_url: { bsonType: ['string', 'null'], description: 'must be a string if provided' },
                  _id: { bsonType: ['objectId', 'null'], description: 'optional ObjectId for media items' },
                },
                additionalProperties: false,
              },
              description: 'must be an array of media objects if provided',
            },
            codeContent: {
              bsonType: ['string', 'null'],
              description: 'must be a string if type is "issue"',
              maxLength: 5000,
            },
            likes: {
              bsonType: 'array',
              items: {
                bsonType: 'object',
                properties: {
                  _id: { bsonType: 'objectId', description: 'optional ObjectId for like items' },
                  userId: { bsonType: 'objectId', description: 'must be a valid ObjectId' },
                  created_at: { bsonType: 'date', description: 'must be a date if provided' },
                },
                additionalProperties: false,
              },
              description: 'must be an array of like objects if provided',
            },
            stars: {
              bsonType: 'array',
              items: {
                bsonType: 'object',
                properties: {
                  userId: { bsonType: 'objectId', description: 'must be a valid ObjectId' },
                  created_at: { bsonType: 'date', description: 'must be a date if provided' },
                },
                additionalProperties: false,
              },
              description: 'must be an array of star objects if provided',
            },
            createdAt: { 
              bsonType: 'date', 
              description: 'timestamp when the document was created and is required',
            },
            updatedAt: { 
              bsonType: 'date', 
              description: 'timestamp when the document was last updated',
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
