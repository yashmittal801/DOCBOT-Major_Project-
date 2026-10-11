import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  chatSessionId: {
    type: String,
    required: true,
    index: true // Group messages by session
  },
  title: {
    type: String,
    default: 'New Conversation' // Auto-named from the first message
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  reply: {
    type: String,
    required: true
  },
  reportUrl: {
    type: String, // Stores the secure Cloudinary URL of the uploaded image/PDF report
    default: null,
  },
  reportPublicId: {
    type: String, // Stores Cloudinary's public_id if you ever need to delete the file
    default: null,
  },
}, { timestamps: true });

export const Chat = mongoose.model('Chat', chatSchema);