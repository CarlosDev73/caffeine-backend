import Post from '../../database/models/post.model.js';
import Comment from '../../database/models/comment.model.js';
import User from '../../database/models/user.model.js';
import ActionHistory from '../../database/models/actionhistory.model.js';
import { uploadImage } from '../../libs/index.js';
import fs from 'fs-extra';
import { assignLevel } from '../../utils/level.utils.js';

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
    const post = await Post.findById(id)
      .populate({
        path: '_userId',
        select: 'userName profileImg level',
        populate: {
          path: 'level', // Asegúrate de que 'level' es el campo referenciado en User
          select: 'name description', // Los campos que quieres del nivel
        },
      });
    if (!post) return res.status(404).json({ message: 'Post no encontrado' });
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el post', error: error });
  }
}

export const createPost = async (req, res) => {
  try {
    const { title, content, type, tags, codeContent } = req.body;
    const _userId = req.user.payload.id;
    const decodedCodeContent = codeContent ? decodeURIComponent(codeContent) : null;
    const newPost = new Post({ _userId, title, content, type, tags: tags ? tags.split(',') : [], codeContent: decodedCodeContent});

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
    const { title, content, type, tags, codeContent } = req.body;
    const decodedCodeContent = codeContent ? decodeURIComponent(codeContent) : null;
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Post no encontrado' });

    if (post._userId.toString() !== req.user.payload.id) {
      return res.status(403).json({ message: 'No tienes permisos para actualizar este post' });
    }

    const creationTime = new Date(post.createdAt); // Convierte createdAt a objeto Date
    const currentTime = new Date(); // Fecha y hora actual

    // Calcula la diferencia en milisegundos y la convierte a horas
    const timeDifferenceInHours = (currentTime - creationTime) / (1000 * 60 * 60);
    if (timeDifferenceInHours > 24) {
      return res.status(403).json({ message: 'Ya no puedes editar el post' });
    }

    // Actualizar los campos básicos
    const updates = {
      title,
      content,
      type,
      tags: tags ? tags.split(',') : [], // Convertir string a array si `tags` está presente
      codeContent: decodedCodeContent,
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

    const creationTime = new Date(post.createdAt); // Convierte createdAt a objeto Date
    const currentTime = new Date(); // Fecha y hora actual

    // Calcula la diferencia en milisegundos y la convierte a horas
    const timeDifferenceInHours = (currentTime - creationTime) / (1000 * 60 * 60);
    if (timeDifferenceInHours > 24) {
      return res.status(403).json({ message: 'Ya no puedes eliminar el post' });
    }

    await Post.findByIdAndDelete(id);
    res.status(200).json({ message: 'Post eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el post', error: error });
  }
}
export const getSearchPost = async (req,res) =>{
  try {
    const { query } = req.query; 

    if (!query) {
      return res.status(400).json({
        message: "Por favor proporciona un término de búsqueda.",
        error: [],
        data: null,
      });
    }

    const posts = await Post.find({
      $or: [
          { title: { $regex: query, $options: "i" } }, // Coincidencia en título
          { tags: { $elemMatch: { $regex: query, $options: "i" } } } // Coincidencia en tags
      ]
    }).select("title content media createdAt");

    return res.json({
      message: "Posts encontrados.",
      error: [],
      data: posts,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Error al buscar posts.",
      error: [{ error: error.message }],
      data: null,
    });
  }
}