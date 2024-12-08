import Post from '../database/models/post.model.js';
import Comment from '../database/models/comment.model.js';
import User from '../database/models/user.model.js';
import ActionHistory from '../database/models/actionhistory.model.js';
import { uploadImage } from '../libs/index.js';
import fs from 'fs-extra';
import { assignLevel } from '../utils/level.utils.js';

export const getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, userIds } = req.query;

    // Filtro opcional: si se proporcionan IDs de usuarios, solo mostrar posts de esos usuarios
    const filter = userIds ? { author: { $in: userIds.split(',') } } : {};

    // Consultar los posts, aplicar filtros, ordenar y paginar
    const posts = await Post.find(filter)
      .sort({ createdAt: -1 }) // Ordenar por fecha de creación descendente
      .skip((page - 1) * limit) // Saltar los primeros N posts según la página
      .limit(Number(limit)) // Limitar el número de posts por página
      .populate('_userId', 'userName profileImg') // Populate userName from User model
      .exec();
    // Obtener la cantidad total de posts (para paginación en el cliente)
    const totalPosts = await Post.countDocuments(filter);
    if (!posts || posts.length === 0) {
      return res.status(200).json({
        message: 'No se encontraron posts',
        posts: [], // Explicitly return an empty array
        totalPosts: 0,
        totalPages: 0,
        currentPage: Number(page),
      });
    }
    res.status(200).json({
      posts: posts.map((post) => ({
        ...post.toObject(),
        userName: post._userId.userName, // Extract userName
        profilePic: post._userId.profileImg, // Extract profilePic
      })),
      totalPosts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el timeline', error });
  }
}
export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params; // Obtener el ID del usuario desde los parámetros
    const { page = 1, limit = 10 } = req.query; // Obtener página y límite de los parámetros de consulta
    // Buscar posts del usuario específico, ordenados por fecha
    const posts = await Post.find({ _userId: userId })
      .sort({ createdAt: -1 }) // Orden descendente por fecha de creación
      .skip((page - 1) * limit) // Saltar los primeros N posts según la página
      .limit(Number(limit)) // Limitar el número de posts por página

    if (!posts || posts.length === 0) {
      return res.status(200).json({
        message: 'No se encontraron posts para este usuario.',
        posts: [], // Explicitly return an empty array
        totalPosts: 0,
        totalPages: 0,
        currentPage: Number(page),
      });
    }

    // Formatear la respuesta con datos adicionales
    const formattedPosts = posts.map((post) => ({
      ...post.toObject(),
      userName: post._userId.userName,
      profilePic: post._userId.profileImg,
    }));

    const totalPosts = await Post.countDocuments({ _userId: userId });

    res.status(200).json({
      message: 'Posts obtenidos con éxito.',
      posts: formattedPosts,
      totalPosts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los posts del usuario.', error });
  }
};

export const getPost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Post no encontrado' });
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el post', error: error });
  }
}

export const createPost = async (req, res) => {
  try {
    const { title, content, type, tags } = req.body;
    const _userId = req.user.payload.id;
    const newPost = new Post({ _userId, title, content, type, tags: tags ? tags.split(',') : [] });

    if (req.files?.postImg) {
      const postMedia = await uploadImage(req.files.postImg.tempFilePath);

      newPost.media = {
        public_id: postMedia.public_id,
        secure_url: postMedia.secure_url
      }

      await fs.unlink(req.files.postImg.tempFilePath); // con esto eliminamos el archivo del back
      //console.log(postMedia) //con esto podemos ver sus propiedades
    }

    const savedPost = await newPost.save();

    try {
      // Check if the user has already been awarded points for creating a post
      const existingAction = await ActionHistory.findOne({
        userId: _userId,
        actionType: 'createPost',
      });

      if (!existingAction) {
        const pointsToAdd = 100; // Points for creating a post
        const user = await User.findById(_userId);
        if (user) {
          user.points = (user.points || 0) + pointsToAdd;
          await user.save();

          await assignLevel(_userId);

          // Record the action
          await ActionHistory.create({
            userId: _userId,
            actionType: 'createPost',
            targetId: savedPost._id,
          });
        } else {
          console.error('User not found for points assignment');
        }
      }
    } catch (pointsError) {
      console.error('Error awarding points or assigning level:', pointsError);
    }
    res.status(201).json({ message: 'Post creado exitosamente', data: savedPost });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el post', error: error });
  }
}

export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, type, tags } = req.body;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Post no encontrado' });

    if (post._userId.toString() !== req.user.payload.id) {
      return res.status(403).json({ message: 'No tienes permisos para actualizar este post' });
    }

    // Actualizar los campos básicos
    const updates = {
      title,
      content,
      type,
      tags: tags ? tags.split(',') : [], // Convertir string a array si `tags` está presente
    };

    // Si hay una nueva imagen, subirla y actualizar el campo `media`
    if (req.files?.postImg) {
      // Eliminar la imagen anterior si existe
      if (post.media?.public_id) {
        await deleteImage(post.media.public_id); // Asegúrate de tener esta función para eliminar imágenes de tu almacenamiento
      }

      const postMedia = await uploadImage(req.files.postImg.tempFilePath);
      updates.media = {
        public_id: postMedia.public_id,
        secure_url: postMedia.secure_url,
      };

      await fs.unlink(req.files.postImg.tempFilePath); // Eliminar el archivo temporal
    }

    // Actualizar el post en la base de datos
    const updatedPost = await Post.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ message: 'Post actualizado exitosamente', post: updatedPost });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el post', errror: error });
  }
}

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Post no encontrado' });

    if (post._userId.toString() !== req.user.payload.id) {
      return res.status(403).json({ message: 'No tienes permisos para eliminar este post' });
    }

    await Post.findByIdAndDelete(id);
    res.status(200).json({ message: 'Post eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el post', error: error });
  }
}
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