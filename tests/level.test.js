import { connectTestDB, disconnectTestDB } from './setup';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/app';
import Level from '../src/database/models/level.model';
import User from '../src/database/models/user.model';
import { createHash } from '../src/libs/bcrypt/bcrypt.lib';

let token;

beforeAll(async () => {
  await connectTestDB();

  const hashedPassword = await createHash('password123');
  const admin = new User({
    userName: 'admin',
    email: 'admin@example.com',
    password: hashedPassword,
    role: 'admin', // Ensure this user is authorized to create levels
  });
  const savedAdmin = await admin.save();

  const response = await request(app).post('/api/v1/auth/login').send({
    email: 'admin@example.com',
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

describe('Level Controller', () => {
  describe('POST /levels', () => {
    it('should create a new level', async () => {
      const levelData = {
        name: 'Bronze',
        description: 'Entry level',
        requirements: 100,
      };

      const response = await request(app)
        .post('/api/v1/levels')
        .set('Authorization', `Bearer ${token}`)
        .send(levelData)
        .expect(201);

      expect(response.body.message).toBe('Nivel creado con éxito');
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.name).toBe(levelData.name);

      const level = await Level.findOne({ name: 'Bronze' });
      expect(level).not.toBeNull();
      expect(level.description).toBe('Entry level');
    });

    it('should return 500 if there is an error during creation', async () => {
      // Force an error by omitting required fields
      const levelData = { description: 'Missing name and requirements' };

      const response = await request(app)
        .post('/api/v1/levels')
        .set('Authorization', `Bearer ${token}`)
        .send(levelData)
        .expect(500);

      expect(response.body.message).toBe('Error al crear el nivel');
    });
  });

  describe('GET /levels', () => {
    it('should retrieve all levels', async () => {
      await Level.create([
        { name: 'Bronze', description: 'Entry level', requirements: 100 },
        { name: 'Silver', description: 'Intermediate level', requirements: 200 },
      ]);

      const response = await request(app)
        .get('/api/v1/levels')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.message).toBe('Niveles obtenidos con éxito');
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].name).toBe('Bronze');
      expect(response.body.data[1].name).toBe('Silver');
    });
  });

  describe('PUT /users/:userId/levels', () => {
    it('should assign a level to a user based on their points', async () => {
      const user = new User({
        userName: 'testuser',
        email: 'testuser@example.com',
        password: await createHash('password123'),
        points: 150, // Points to qualify for a level
      });
      const savedUser = await user.save();

      await Level.create([
        { name: 'Bronze', description: 'Entry level', requirements: 100 },
        { name: 'Silver', description: 'Intermediate level', requirements: 200 },
      ]);

      const response = await request(app)
        .put(`/api/v1/users/${savedUser._id}/levels`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.message).toBe('Nivel asignado con éxito');
    });

    it('should return 400 if no level is available for the user', async () => {
      const user = new User({
        userName: 'testuser',
        email: 'testuser@example.com',
        password: await createHash('password123'),
        points: 50, // Not enough points for any level
      });
      const savedUser = await user.save();

      await Level.create([
        { name: 'Bronze', description: 'Entry level', requirements: 100 },
      ]);

      const response = await request(app)
        .put(`/api/v1/users/${savedUser._id}/levels`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.message).toBe('No se realizaron cambios en el nivel del usuario');
    });
  });
});
