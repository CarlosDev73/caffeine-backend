import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    _userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    title: {
        type: String,
        required: true,
        maxlength: 120
    },
    content: {
        type: String,
        required: true,
    },
    tags: [{
        type: String,
        maxlength: 60,
    }],
    category: [{
        type: String,
        maxlength: 60,
    }],
    type: {
        type: String,
        enum: ['post', 'issue'],
        required: true
    },
    media: [{
        public_id: String,
        secure_url: String
    }],
    codeContent: {
        type: String,
        maxlength: 5000, // Optional limit for code content
        required: function () {
            return this.type === 'issue'; // Required only for issues
          },
    },
    likes: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User', // Referencia a la colección de usuarios
                required: true,
            },
            created_at: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    stars: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User', // Referencia a la colección de usuarios
                required: true,
            },
            created_at: {
                type: Date,
                default: Date.now,
            },
        },
    ]
},
{
    timestamps: true // con eso agregamos de manera automatica createdAt y updatedAt
});

export default mongoose.model('Post', postSchema) 