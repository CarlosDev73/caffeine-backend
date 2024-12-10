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

  const response = await request(app).post('/api/v1/auth/login').send({
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
          codeContent: 'This is a code post content',
          type: 'issue',
          tags: 'laravel',
        };
      
        const response = await request(app)
          .post('/api/v1/posts') // Asegúrate de que la ruta sea correcta
          .set('Authorization', `Bearer ${token}`)
          .send(postData)
          .expect(201); // Cambia de 200 a 201
      
        expect(response.body.message).toBe('Post creado exitosamente');
        expect(response.body.data).toHaveProperty('_id');
      });
  });
});

describe('PUT /posts/:id', () => {
  it('should update a post', async () => {
    const post = await new Post({
      _userId: userId,
      title: 'Original Title',
      content: 'Original Content',
      type: 'post',
    }).save();

    const updates = {
      title: 'Updated Title',
      content: 'Updated Content',
    };

    const response = await request(app)
      .put(`/api/v1/posts/${post._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updates)
      .expect(200);

    expect(response.body.message).toBe('Post actualizado exitosamente');
    expect(response.body.post.title).toBe('Updated Title');
  });

  it('should return 403 if trying to update another user’s post', async () => {
    const anotherUser = new User({
      userName: 'anotherUser',
      email: 'another@example.com',
      password: await createHash('password123'),
    });
    const savedUser = await anotherUser.save();

    const post = await new Post({
      _userId: savedUser._id,
      title: 'Another User Post',
      content: 'Content',
      type: 'post',
    }).save();

    const response = await request(app)
      .put(`/api/v1/posts/${post._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Unauthorized Update' })
      .expect(403);

    expect(response.body.message).toBe('No tienes permisos para actualizar este post');
  });
});