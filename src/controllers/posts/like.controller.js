import Post from '../../database/models/post.model.js';
import User from '../../database/models/user.model.js';
import ActionHistory from '../../database/models/actionhistory.model.js';
import { assignLevel } from '../../utils/level.utils.js';

export const likePost = async (req, res) => {
    try {
      const { id } = req.params; // ID of the post
      const userId = req.user.payload.id; // Authenticated user's ID
  
      const post = await Post.findById(id);
      if (!post) {
        return res.status(404).json({ message: 'Post not found.' });
      }
  
      // Check if the action already exists
      const existingAction = await ActionHistory.findOne({
        userId,
        actionType: 'likePost',
        targetId: id,
      });
  
      if (existingAction) {
        return res.status(200).json({
          message: 'Post already liked. No points awarded.',
          data: {
            post,
            actionExists: true,
          },
        });
      }
  
      // Add the like
      post.likes.push({ userId });
      await post.save();
  
      // Award points to the post's author
      const pointsToAdd = 2; // Define points for receiving a like
      const postAuthor = await User.findById(post._userId); // Find the post's author
      if (postAuthor) {
        postAuthor.points = (postAuthor.points || 0) + pointsToAdd; // Increment author's points
        await postAuthor.save();
  
        // Check if the author qualifies for a new level
        await assignLevel(post._userId);
      }
  
      // Record the action in ActionHistory
      await ActionHistory.create({
        userId,
        actionType: 'likePost',
        targetId: id,
      });
  
      res.status(200).json({
        message: 'Post liked successfully, and points awarded to the author.',
        data: {
          post,
          postAuthor: {
            id: postAuthor._id,
            points: postAuthor.points,
          },
        },
      });
    } catch (error) {
      console.error('Error liking the post:', error);
      res.status(500).json({ message: 'Error liking the post.', error });
    }
  };
  
  export const unlikePost = async (req, res) => {
    try {
      const { id } = req.params; // ID of the post
      const userId = req.user.payload.id; // Authenticated user's ID
  
      const post = await Post.findById(id);
      if (!post) {
        return res.status(404).json({ message: 'Post not found.' });
      }
  
      // Filter out the user's like
      post.likes = post.likes.filter((like) => like.userId.toString() !== userId);
      await post.save();
  
      res.status(200).json({ message: 'Like removed successfully.', post });
    } catch (error) {
      console.error('Error unliking the post:', error);
      res.status(500).json({ message: 'Error unliking the post.', error });
    }
  };
  
  export const getPostLikes = async (req, res) => {
    try {
      const { id } = req.params; // Get post ID from URL
      const post = await Post.findById(id).populate('likes.userId', 'userName profileImg'); // Ensure 'id' exists and is valid
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      res.status(200).json(post.likes || []); // Return likes array
    } catch (error) {
      console.error('Error fetching post likes:', error);
      res.status(500).json({ message: 'Error fetching post likes', error });
    }
  };