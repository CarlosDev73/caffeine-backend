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

    // Fetch todos los posts favoritos de un usuario
    const favorites = await Favorite.find({ userId })
      .populate('postId', 'title content media')
      .sort({ createdAt: -1 });

    if (favorites.length === 0) {
      return res.status(404).json({ message: 'Favoritos no encontrados' });
    }

    res.status(200).json({ message: 'Favoritos obtenidos correctamente', favorites });
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo favoritos', error });
  }
};
