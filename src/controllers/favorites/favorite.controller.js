import Favorite from '../../database/models/favorite.model.js';
import User from '../../database/models/user.model.js';
import Post from '../../database/models/post.model.js';
import ActionHistory from '../../database/models/actionhistory.model.js';
import { assignLevel } from '../../utils/level.utils.js';

export const markAsFavorite = async (req, res) => {
  try {
    const { postId } = req.params; // Obtener postId de la URL
    const userId = req.user.payload.id;

    // Chequea si el post ya fue marcado como favorito
    const existingFavorite = await Favorite.findOne({ userId, postId });
    if (existingFavorite) {
      return res.status(200).json({
        message: 'El post ya estaba marcado como favorito.',
        data: existingFavorite,
      });
    }

    // Crea el favorito
    const favorite = new Favorite({ userId, postId });
    await favorite.save();

    // Award points to the author of the post
    const post = await Post.findById(postId).populate('_userId');
    if (!post) {
      return res.status(404).json({ message: 'Post no encontrado' });
    }

    const pointsToAdd = 10; 
    const postAuthor = await User.findById(post._userId._id);
    if (postAuthor) {
      const existingAction = await ActionHistory.findOne({
        userId: post._userId._id,
        actionType: 'favoritePost',
        targetId: postId,
      });
      if (!existingAction) {
        postAuthor.points = (postAuthor.points || 0) + pointsToAdd;
        await postAuthor.save();

        await ActionHistory.create({
          userId: post._userId._id,
          actionType: 'favoritePost',
          targetId: postId,
        });

        await assignLevel(post._userId._id);
      }
    }

    res.status(201).json({
      message: 'Post marcado como favorito y puntos otorgados al autor.',
      data: {
        favorite,
        postAuthor: {
          id: postAuthor._id,
          points: postAuthor.points,
        },
      },
    });
  } catch (error) {
    console.error('Error al marcar el post como favorito:', error);
    res.status(500).json({ message: 'Error al marcar el post como favorito.', error });
  }
};


export const unmarkAsFavorite = async (req, res) => {
  try {
    const { postId } = req.params; // Obtener postId de la URL
    const userId = req.user.payload.id;

    // Quita el favorito
    const favorite = await Favorite.findOneAndDelete({ userId, postId });

    if (!favorite) {
      return res.status(404).json({ message: 'Favorito no encontrado' });
    }

    res.status(200).json({ message: 'Post desmarcado como favorito' });
  } catch (error) {
    res.status(500).json({ message: 'Error al desmarcar el post como favorito', error });
  }
};


export const getUserFavorites = async (req, res) => {
  try {
    const userId = req.user.payload.id;
    const { page = 1, limit = 10 } = req.query;

    // Fetch todos los posts favoritos de un usuario
    const favorites = await Favorite.find({ userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate({
        path: 'postId',
        select: 'title content media createdAt likesCount isLiked comments _userId',
        populate: {
          path: '_userId',
          select: 'userName profileImg', // Include user details
        },
      })
      .exec();
    // Filter out favorites with null or missing post references
    const validFavorites = favorites.filter((favorite) => favorite.postId !== null);

    if (!validFavorites || validFavorites.length === 0) {
      return res.status(200).json({
        message: 'No se encontraron posts para este usuario.',
        favorites: [], // Explicitly return an empty array
        totalFavorites: 0,
        totalPages: 0,
        currentPage: Number(page),
      });
    }

    const formattedFavorites = validFavorites.map((favorite) => ({
      _id: favorite.postId._id,
      title: favorite.postId.title,
      content: favorite.postId.content,
      media: favorite.postId.media,
      createdAt: favorite.postId.createdAt,
      likesCount: favorite.postId.likesCount || 0,
      isLiked: favorite.postId.isLiked || false,
      comments: favorite.postId.comments || [],
      _userId: favorite.postId._userId,
    }));

    const totalFavorites = await Favorite.countDocuments({ userId });

    res.status(200).json({
      message: 'Favoritos obtenidos correctamente',
      favorites: formattedFavorites,
      totalFavorites,
      totalPages: Math.ceil(totalFavorites / limit),
      currentPage: Number(page),
    });

  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo favoritos', error });
  }
};

export const getPostFavorites = async (req, res) => {
  try {
    const { postId } = req.params;

    // Find all favorites for the given postId
    const favorites = await Favorite.find({ postId }).populate('userId', 'userName profileImg');

    if (!favorites || favorites.length === 0) {
      return res.status(200).json({ message: 'No favorites found for this post.', favorites: [] });
    }

    res.status(200).json({
      message: 'Favorites fetched successfully.',
      favorites: favorites.map((favorite) => ({
        userId: favorite.userId._id,
        userName: favorite.userId.userName,
        profileImg: favorite.userId.profileImg,
        createdAt: favorite.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching post favorites:', error);
    res.status(500).json({ message: 'Error fetching post favorites.', error });
  }
};
