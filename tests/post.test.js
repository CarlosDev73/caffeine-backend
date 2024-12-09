import { connectTestDB, disconnectTestDB } from './setup';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/app';
import User from '../src/database/models/user.model';
import Post from '../src/database/models/post.model';
import { createHash } from '../src/libs/bcrypt/bcrypt.lib';

let token;
let userId;

beforeAll(async () => {
  await connectTestDB();

  const hashedPassword = await createHash('password123');
  const user = new User({
    userName: 'testuser',
    email: 'test@example.com',
    password: hashedPassword,
  });
  const savedUser = await user.save();
  userId = savedUser._id;

  const response = await request(app).post('/api/v1/login').send({
    email: 'test@example.com',
    password: 'password123',
  });
  token = response.body.data.token;
});

afterAll(async () => {
  await disconnectTestDB();
});

afterEach(async () => {
  await mongoose.connection.db.dropDatabase();
});

describe('Post Controller', () => {
  describe('POST /post', () => {
    it('should create a new post', async () => {
        const postData = {
          title: 'Test Post',
          content: 'This is a test post content',
          type: 'issue',
          tags: 'laravel',
        };
      
        const response = await request(app)
          .post('/api/v1/post') // Asegúrate de que la ruta sea correcta
          .set('Authorization', `Bearer ${token}`)
          .send(postData)
          .expect(201); // Cambia de 200 a 201
      
        expect(response.body.message).toBe('Post creado exitosamente');
        expect(response.body.data).toHaveProperty('_id');
      });
  });
});
