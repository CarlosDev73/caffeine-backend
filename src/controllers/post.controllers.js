import Post from '../database/models/post.model.js';
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
    const { title, content, type } = req.body;
    const _userId = req.user.payload.id;
    const newPost = new Post({ _userId, title, content, type });

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
    const { title, content } = req.body;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Post no encontrado' });

    if (post._userId.toString() !== req.user.payload.id) {
      return res.status(403).json({ message: 'No tienes permisos para actualizar este post' });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { title, content },
      { new: true, runValidators: true }
    );
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