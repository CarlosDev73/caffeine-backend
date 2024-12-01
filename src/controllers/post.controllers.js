import Post from '../database/models/post.model.js';
import Comment from '../database/models/comment.model.js';
import { uploadImage } from '../libs/index.js';
import fs from 'fs-extra';

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
      return res.status(404).json({ message: 'No se encontraron posts para este usuario.' });
    }

    // Formatear la respuesta con datos adicionales
    const formattedPosts = posts.map((post) => ({
      ...post.toObject(),
      userName: post._userId.userName,
      profilePic: post._userId.profileImg,
    }));

    res.status(200).json({ message: 'Posts obtenidos con éxito.', posts: formattedPosts });
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

    if(req.files?.postImg){
      const postMedia = await uploadImage(req.files.postImg.tempFilePath);

      newPost.media = {
        public_id: postMedia.public_id,
        secure_url: postMedia.secure_url
      }
      
      await fs.unlink(req.files.postImg.tempFilePath); // con esto eliminamos el archivo del back
      //console.log(postMedia) //con esto podemos ver sus propiedades
    }

    const savedPost = await newPost.save();
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

    const newComment = new Comment({
      _postId: postId,
      _userId,
      content,
      isCorrect: isCorrect || false,
      _levelId: levelId || null,
    });

    const savedComment = await newComment.save();
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
      return res.status(404).json({ message: 'No se encontraron comentarios para este post.' });
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