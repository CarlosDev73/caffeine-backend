import { Router } from 'express';
import { getPosts, getPost, createPost, updatePost, deletePost, getUserPosts } from '../../controllers/posts/post.controllers.js';
import { createComment, getCommentsByPost, toggleLikeComment, markCommentAsCorrect } from '../../controllers/posts/comment.controller.js';
import { getPostLikes, likePost, unlikePost } from '../../controllers/posts/like.controller.js';
import { authenticateUser } from '../../middlewares/auth.js';


const router = Router(); 
//Posts
router.get('/posts', authenticateUser, getPosts);
router.get('/posts/:id', authenticateUser, getPost);
router.get('/users/:userId/posts', authenticateUser, getUserPosts);
router.post('/posts', authenticateUser, createPost);
router.put('/posts/:id', authenticateUser, updatePost);
router.delete('/posts/:id', authenticateUser, deletePost);

//Comments
router.post('/posts/:postId/comments', authenticateUser, createComment);
router.get('/posts/:postId/comments', authenticateUser, getCommentsByPost);
router.put('/comments/:commentId/likes', authenticateUser, toggleLikeComment);
router.put('/comments/:commentId/correct', authenticateUser, markCommentAsCorrect);

//Likes
router.post('/posts/:id/likes', authenticateUser, likePost);
router.delete('/posts/:id/likes', authenticateUser, unlikePost);
router.get('/posts/:id/likes', authenticateUser, getPostLikes);


export default router