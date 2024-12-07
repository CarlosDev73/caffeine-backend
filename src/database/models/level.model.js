import mongoose from 'mongoose';

const levelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 50,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    requirements: {
      type: Number,
      required: true,
      min: 0, // Los puntos requeridos no pueden ser negativos
    },
  },
  {
    timestamps: true, // Para agregar automáticamente `createdAt` y `updatedAt`
  }
);

export default mongoose.model('Level', levelSchema);
