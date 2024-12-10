import Post from '../../database/models/post.model.js';
import Comment from '../../database/models/comment.model.js';
import User from '../../database/models/user.model.js';
import ActionHistory from '../../database/models/actionhistory.model.js';
import { assignLevel } from '../../utils/level.utils.js';

export const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, isCorrect, levelId } = req.body;
    const _userId = req.user.payload.id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post no encontrado' });

    // Check if the user has already commented on this post
    const existingAction = await ActionHistory.findOne({
      userId: _userId,
      actionType: 'createComment',
      targetId: postId,
    });

    const newComment = new Comment({
      _postId: postId,
      _userId,
      content,
      isCorrect: isCorrect || false,
      _levelId: levelId || null,
    });

    const savedComment = await newComment.save();

    // Only assign points for the first comment on the post
    if (!existingAction) {
      const pointsToAdd = 15; // Points for creating a comment
      const user = await User.findById(_userId);
      if (user) {
        user.points = (user.points || 0) + pointsToAdd; // Increment points safely
        await user.save();

        // Reassign level if the user qualifies for a new level
        await assignLevel(_userId);

        // Record the action in ActionHistory
        await ActionHistory.create({
          userId: _userId,
          actionType: 'createComment',
          targetId: postId,
        });
      }
    }
    res.status(201).json({ message: 'Comentario creado con éxito', data: savedComment });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el comentario', error });
  }
};

export const getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ _postId: postId })
      .sort({ createdAt: -1 })
      .populate('_userId', 'userName profileImg');

    if (!comments || comments.length === 0) {
      return res.status(200).json({
        message: 'Este post no tiene comentarios aún.',
        comments: [], // Explicitly return an empty array
      });
    }

    res.status(200).json({
      message: 'Comentarios obtenidos con éxito.',
      comments: comments.map((comment) => ({
        ...comment.toObject(),
        userName: comment._userId.userName,
        profilePic: comment._userId.profileImg,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los comentarios', error });
  }
};

export const toggleLikeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const _userId = req.user.payload.id;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comentario no encontrado' });
    }

    const userHasLiked = comment.likes.some((like) => like._userId.toString() === _userId);

    if (userHasLiked) {
      // Si el usuario ya dio like, eliminar el like
      comment.likes = comment.likes.filter((like) => like._userId.toString() !== _userId);
    } else {
      // Si no ha dado like, agregarlo
      comment.likes.push({ _userId });
    }

    const updatedComment = await comment.save();
    res.status(200).json({
      message: userHasLiked ? 'Like eliminado del comentario' : 'Like agregado al comentario',
      data: updatedComment
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al modificar el like del comentario', error });
  }
};

export const markCommentAsCorrect = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.payload.id; // ID del usuario autenticado

    // Buscar el comentario por ID
    const comment = await Comment.findById(commentId).populate('_postId', '_userId');

    if (!comment) {
      return res.status(404).json({ message: 'Comentario no encontrado' });
    }

    // Verificar si el usuario es el autor del post asociado al comentario
    if (comment._postId._userId.toString() !== userId) {
      return res.status(403).json({
        message: 'No tienes permiso para marcar este comentario como correcto',
      });
    }
    // Si el comentario ya fue marcado como correcto, finalizar sin error
    if (comment.isCorrect) {
      return res.status(200).json({
        message: 'Este comentario ya estaba marcado como correcto.',
        data: comment,
      });
    }

    // Actualizar el comentario para marcarlo como correcto
    comment.isCorrect = true;
    await comment.save();

    const pointsToAdd = 50;
    const commentAuthor = await User.findById(comment._userId);

    if (commentAuthor) {
      const existingAction = await ActionHistory.findOne({
        userId: comment._userId,
        actionType: 'markCommentAsCorrect',
        targetId: commentId,
      });
      if (!existingAction) {
        // Incrementar puntos al autor del comentario
        commentAuthor.points = (commentAuthor.points || 0) + pointsToAdd;
        await commentAuthor.save();

        // Registrar la acción en ActionHistory
        await ActionHistory.create({
          userId: comment._userId,
          actionType: 'markCommentAsCorrect',
          targetId: commentId,
        });

        // Reasignar nivel si corresponde
        await assignLevel(comment._userId);
      }
    }

    res.status(200).json({
      message: 'Comentario marcado como correcto y puntos otorgados al autor del comentario',
      data: {
        comment,
        commentAuthor: {
          id: commentAuthor._id,
          points: commentAuthor.points,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al marcar el comentario como correcto', error });
  }
};