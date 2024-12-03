import Favorite from '../database/models/favorite.model.js';

export const markAsFavorite = async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req.user.payload.id;

    // Chequea si el post ya fue marcado como favorito
    const existingFavorite = await Favorite.findOne({ userId, postId });
    if (existingFavorite) {
      return res.status(400).json({ message: 'Este post ya esta marcado como favorito' });
    }

    // Crea el favorito
    const favorite = new Favorite({ userId, postId });
    await favorite.save();

    res.status(201).json({ message: 'Post marcado como favorito', favorite });
  } catch (error) {
    res.status(500).json({ message: 'Error al marcar el post como favorito', error });
  }
};

export const unmarkAsFavorite = async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req.user.payload.id;

    // Quita el favorito
    const favorite = await Favorite.findOneAndDelete({ userId, postId });

    if (!favorite) {
      return res.status(404).json({ message: 'Favorito no encontrados' });
    }

    res.status(200).json({ message: 'Post desmarcado como favorito' });
  } catch (error) {
    res.status(500).json({ message: 'Error desmarcado el post como favorito', error });
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

      if (!favorites || favorites.length === 0) {
        return res.status(200).json({
          message: 'No se encontraron posts para este usuario.',
          favorites: [], // Explicitly return an empty array
          totalFavorites: 0,
          totalPages: 0,
          currentPage: Number(page),
        });
      }

    const formattedFavorites = favorites.map((favorite) => ({
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

    const totalFavorites= await Favorite.countDocuments();

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
