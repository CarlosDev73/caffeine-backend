import mongoose from 'mongoose';

const actionHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    actionType: {
      type: String,
      enum: ['likePost', 'markCommentAsCorrect', 'favoritePost', 'createComment', 'createPost'], // Define your actions
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId, // Could be a Post or Comment ID
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('ActionHistory', actionHistorySchema);
