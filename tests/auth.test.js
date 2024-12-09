// Configuración de la clave secreta para los tests
process.env.SECRET_KEY = 'testsecret';

import { connectTestDB, disconnectTestDB } from './setup';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/app';
import User from '../src/database/models/user.model';
import { createHash } from '../src/libs/bcrypt/bcrypt.lib';

beforeAll(async () => {
  await connectTestDB(); // Conexión a la base de datos en memoria
});

afterAll(async () => {
  await disconnectTestDB(); // Desconexión y limpieza
});

afterEach(async () => {
  // Limpia la base de datos después de cada prueba
  await mongoose.connection.db.dropDatabase();
});

describe('Auth Controller', () => {
  describe('POST /register', () => {
    it('should register a new user', async () => {
      const userData = {
        userName: 'testuser',
        displayName: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/v1/register') // Ruta relativa
        .send(userData)
        .expect(200); // Espera un código 200 de éxito

      expect(response.body.message).toBe('Usuario registrado con éxito');
      const user = await User.findOne({ email: userData.email });
      expect(user).not.toBeNull();
      expect(user.userName).toBe(userData.userName);
    });

    // it('should return 409 if email already exists', async () => {
    //   const userData = {
    //     userName: 'testuser',
    //     displayName: 'Test User',
    //     email: 'duplicate@example.com',
    //     password: 'password123',
    //   };

    //   // Prepopula la base de datos con el mismo usuario
    //   const hashedPassword = await createHash(userData.password);
    //   await new User({ ...userData, password: hashedPassword }).save();

    //   const response = await request(app)
    //     .post('/api/v1/register') // Ruta relativa
    //     .send(userData)
    //     .expect(409); // Espera un código 409 de conflicto

    //   expect(response.body.message).toBe('Ya existe un usuario registrado con esos datos');
    // });
  });

  describe('POST /login', () => {
    it('should login an existing user', async () => {
      const userData = {
        userName: 'testuser',
        displayName: 'Test User',
        email: 'testlogin@example.com',
        password: 'password123',
      };

      const hashedPassword = await createHash(userData.password); // Hashea la contraseña para los datos de prueba
      const user = new User({ ...userData, password: hashedPassword });
      await user.save();

      const response = await request(app)
        .post('/api/v1/login') // Ruta relativa
        .send({ email: userData.email, password: userData.password })
        .expect(200);

      expect(response.body.message).toBe('Usuario ingreso con exito');
      expect(response.body.data.token).toBeDefined(); // Asegúrate de que se devuelve un token
    });

    it('should return 400 for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/login') // Ruta relativa
        .send({ email: 'nonexistent@example.com', password: 'wrongpassword' })
        .expect(400);

      expect(response.body.message).toBe('Credenciales incorrectas');
    });
  });
});
