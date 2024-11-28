import { Router } from 'express';
import { getPosts, getPost, createPost, updatePost, deletePost } from '../../controllers/post.controllers.js';
import { authenticateUser } from '../../middlewares/auth.js';


const router = Router(); 

router.get('/posts', authenticateUser, getPosts);

router.get('/post/:id', authenticateUser, getPost);
router.post('/post', authenticateUser, createPost);
router.put('/post/:id', authenticateUser, updatePost);
router.delete('/post/:id', authenticateUser, deletePost);

export default router