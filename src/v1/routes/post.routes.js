import { Router } from 'express';
import { getPosts, getPost, createPost, updatePost, deletePost, getUserPosts, createComment, getCommentsByPost, likePost, unlikePost } from '../../controllers/post.controllers.js';
import { authenticateUser } from '../../middlewares/auth.js';


const router = Router(); 

router.get('/posts', authenticateUser, getPosts);

router.get('/post/:id', authenticateUser, getPost);
router.get('/user/:userId/posts', authenticateUser, getUserPosts);
router.post('/post', authenticateUser, createPost);
router.put('/post/:id', authenticateUser, updatePost);
router.delete('/post/:id', authenticateUser, deletePost);
router.post('/post/:postId/comment', authenticateUser, createComment);
router.get('/post/:postId/comments', authenticateUser, getCommentsByPost);
router.post('/post/:id/like', authenticateUser, likePost);
router.delete('/post/:id/like', authenticateUser, unlikePost);

export default router