import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { Chat } from '../models/chat.model.js';
import { User } from '../models/user.model.js';
import { GoogleGenAI } from '@google/genai';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { v2 as cloudinary } from 'cloudinary';

// Initialize Google Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const handleChatQuery = asyncHandler(async (req, res) => {
  const { message, chatSessionId } = req.body;
  const userId = req.user?._id;
  const reportFile = req.file;

  if (!message && !reportFile) {
    throw new apiError(400, 'Message query or medical report is required');
  }

  // Fetch fresh user details and health profile for context tracking
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new apiError(404, 'User not found');
  }

  let cloudFileUrl = null;
  let cloudPublicId = null; // Track public_id for rollback cleanup
  let contents = [];

  // Build contextual prompt for DocBot persona
  const systemPrompt = `You are DocBot, an educational AI first-aid simulator. Your purpose is to provide short, highly scannable, structured home care instructions and first-aid steps. 

  Patient Context:
  - Name: ${user.name}
  - Age: ${user.healthProfile?.age || 'Not specified'}
  - Blood Group: ${user.healthProfile?.bloodGroup || 'Not specified'}

  CRITICAL FORMATTING RULES:
  1. Keep responses short, concise, and structured with clean bullet points.
  2. Avoid long paragraphs. Use bold headers for key remedies or steps.
  3. Include a very brief "When to see a doctor" section if necessary.
  4. Conclude with a one-line medical disclaimer.

  User's current message: "${message || 'Please analyze this attached medical report.'}"`;
  
  contents.push(systemPrompt);
  contents.push(message || "Please analyze this attached medical report.");

  try {
    // 💡 Step 1: Handle Cloudinary upload with dedicated safety check
    if (reportFile) {
      try {
        const cloudinaryResponse = await uploadOnCloudinary(reportFile.buffer);
        cloudFileUrl = cloudinaryResponse.secure_url;
        cloudPublicId = cloudinaryResponse.public_id; 
      } catch (uploadError) {
        console.error("Cloudinary Upload Error:", uploadError);
        throw new apiError(500, "Failed to upload medical report to cloud storage.");
      }

      contents.push({
        inlineData: {
          data: reportFile.buffer.toString('base64'),
          mimeType: reportFile.mimetype
        }
      });
    }

    const selectedModel = process.env.GEMINI_MODEL_NAME || 'gemini-2.5-flash';
    
    // 💡 Step 2: Generate AI Content with safety rollback wrapper
    let response;
    try {
      response = await ai.models.generateContent({
        model: selectedModel,
        contents: contents,
        config: {
          safetySettings: [
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_ONLY_HIGH',
            }
          ]
        }
      });
    } catch (aiError) {
      console.error("Gemini API Error:", aiError);
      
      // Rollback: If file was uploaded to Cloudinary but AI generation fails, delete the orphan file
      if (cloudPublicId) {
        await cloudinary.uploader.destroy(cloudPublicId).catch((err) => 
          console.error("Cloudinary Rollback Failed:", err)
        );
      }
      
      throw new apiError(502, "AI health assistant failed to generate a response. Please try again.");
    }

    const aiReply = response.text || 'Please consult a qualified medical professional.';

    // 💡 Fallback session ID if none provided by frontend
    const activeSessionId = chatSessionId || 'default_session';

    // Check if this is the first message in the session to generate a session title
    const messageCount = await Chat.countDocuments({ user: userId, chatSessionId: activeSessionId });
    const sessionTitle = messageCount === 0 ? (message ? message.slice(0, 30) + '...' : 'Medical Report Analysis') : undefined;

    // 💡 Step 3: Save interaction to database including chatSessionId and cloud identifiers
    const chatDoc = await Chat.create({
      user: userId,
      chatSessionId: activeSessionId,
      title: sessionTitle,
      message: message || "[Attached Medical Report]",
      reply: aiReply,
      reportUrl: cloudFileUrl,
      reportPublicId: cloudPublicId
    });

    return res.status(200).json(
      new apiResponse(200, { reply: aiReply, reportUrl: cloudFileUrl, chatDoc }, 'Medical report analyzed successfully')
    );

  } catch (error) {
    console.log("error", error);
    if (error instanceof apiError) throw error;
    throw new apiError(500, error?.message || 'Failed to generate response and analyze medical report');
  }
});

// 💡 1. Fetch recent chat sessions grouped by chatSessionId for the sidebar
const getRecentSessions = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const sessions = await Chat.aggregate([
    { $match: { user: userId } },
    { $sort: { createdAt: -1 } },     {$group: {
        _id: '$chatSessionId',
        title: { $first: '$title' },
        createdAt: { $first: '$createdAt' }
      }
    },
    { $sort: { createdAt: -1 } },     {$limit: 15 } // Limit to last 15 recent conversations
  ]);

  return res.status(200).json(
    new apiResponse(200, { sessions }, 'Recent chat sessions fetched successfully')
  );
});

// 💡 2. Fetch all messages belonging to a specific session ID
const getSessionMessages = asyncHandler(async (req, res) => {
  const { chatSessionId } = req.params;
  const userId = req.user?._id;

  const history = await Chat.find({ user: userId, chatSessionId }).sort({ createdAt: 1 });

  return res.status(200).json(
    new apiResponse(200, { history }, 'Session chat history fetched successfully')
  );
});

// Keep backward compatibility if anything else calls getChatHistory
const getChatHistory = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const history = await Chat.find({ user: userId }).sort({ createdAt: 1 });

  return res.status(200).json(
    new apiResponse(200, { history }, 'Chat history fetched successfully')
  );
});

export { handleChatQuery, getChatHistory, getRecentSessions, getSessionMessages };