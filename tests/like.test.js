import { connectTestDB, disconnectTestDB } from './setup';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/app';
import User from '../src/database/models/user.model';
import Post from '../src/database/models/post.model';
import { createHash } from '../src/libs/bcrypt/bcrypt.lib';

let token;
let userId;
let postId;

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

  const post = new Post({
    _userId: userId,
    title: 'Test Post',
    content: 'This is a test post',
    type: 'post',
  });
  const savedPost = await post.save();
  postId = savedPost._id;
});

afterAll(async () => {
  await disconnectTestDB();
});

afterEach(async () => {
  await mongoose.connection.db.dropDatabase();
});

describe('Post Likes Controller', () => {
  describe('POST /posts/:id/like', () => {
    it('should like a post and award points to the author', async () => {
      const response = await request(app)
        .post(`/api/v1/posts/${postId}/likes`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.message).toBe('Post liked successfully, and points awarded to the author.');
      expect(response.body.data.post.likes).toHaveLength(1);
      expect(response.body.data.post.likes[0].userId).toBe(userId.toString());

      const post = await Post.findById(postId);
      expect(post.likes).toHaveLength(1);

      const author = await User.findById(userId);
      expect(author.points).toBe(2); // Default points for liking a post
    });

    it('should return 404 if the post is not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .post(`/api/v1/posts/${fakeId}/likes`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.message).toBe('Post not found.');
    });
  });

});
