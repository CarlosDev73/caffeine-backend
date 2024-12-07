import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    _postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true
    },
    _userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    _levelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Level',
      default: null
    },
    content: {
      type: String,
      required: true
    },
    isCorrect: {
      type: Boolean,
      default: false
    },
    likes: [
      {
        _userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model('Comment', commentSchema);
