import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { Chat } from '../models/chat.model.js';
import { User } from '../models/user.model.js';
import { GoogleGenAI } from '@google/genai';

// Initialize Google Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const handleChatQuery = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const userId = req.user?._id;

  if (!message) {
    throw new apiError(400, 'Message query is required');
  }

  // Fetch fresh user details and health profile for context tracking
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new apiError(404, 'User not found');
  }

  // Build contextual prompt for DocBot persona
  const systemPrompt = `You are DocBot, an expert AI healthcare first-aid assistant and health tracker. 
  Patient Context:
  - Name: ${user.name}
  - Age: ${user.healthProfile?.age || 'Not specified'}
  - Blood Group: ${user.healthProfile?.bloodGroup || 'Not specified'}
  - Vitals & Existing Notes: ${user.healthProfile?.illnessDescription || 'None'}

  Your task is to analyze the user's current symptoms, provide safe first-aid advice, home remedies, precautions, and best health practices. Always conclude with a brief medical disclaimer advising them to consult a licensed physician for serious issues.

  User's current message: "${message}"`;

  try {
     const selectedModel = process.env.GEMINI_MODEL_NAME || 'gemini-3.8-flash';
    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: systemPrompt,
    });

    const aiReply = response.text;

    // Save interaction to database for longitudinal health tracking & context history
    await Chat.create({
      user: userId,
      message,
      reply: aiReply
    });

    return res.status(200).json(
      new apiResponse(200, { reply: aiReply }, 'AI health suggestion generated successfully')
    );

  } catch (error) {
    throw new apiError(500, error?.message || 'Failed to generate response from AI health assistant');
  }
});

export { handleChatQuery };