const { HttpStatusCode } = require("axios");
const prisma = require("../config/db");
const { getAIResponse } = require("../services/chat.service");
const ApiError = require("../utils/apiError");
const {
  createChatValidation,
  chatWithAIValidation,
} = require("../validations/chat.validation");
const { ERROR_MESSAGES } = require("../utils/constants");

exports.chatWithAI = async (req, res, next) => {
  try {
    const { error } = chatWithAIValidation.validate(req.body);
    if (error)
      throw new ApiError(HttpStatusCode.BadRequest, error.details[0].message);

    const { agentType, prompt, bodyChatId } = req.body;
    const userId = req.user.userId;

    let createChat;
    if (!bodyChatId) {
      createChat = await prisma.chat.create({
        data: { userId },
      });
    }

    const chatId = createChat?.id || bodyChatId;

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { messages: true },
    });

    if (!chat || chat.userId !== userId) {
      throw new ApiError(
        HttpStatusCode.NotFound,
        ERROR_MESSAGES.CHAT_NOT_FOUND
      );
    }

    const aiResponse = await getAIResponse(prompt, agentType);

    await prisma.message.createMany({
      data: [
        { chatId, sender: "user", content: prompt },
        { chatId, sender: "ai", content: aiResponse },
      ],
    });

    return res.json({
      success: true,
      message: "AI response received successfully.",
      data: { chatId, response: aiResponse },
    });
  } catch (err) {
    next(err);
  }
};

exports.getChatHistory = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const chats = await prisma.chat.findMany({
      where: { userId },
      include: { messages: { orderBy: { timestamp: "asc" } } },
    });

    if (!chats || chats.length === 0) {
      throw new ApiError(
        HttpStatusCode.NotFound,
        ERROR_MESSAGES.NO_CHATS_FOUND
      );
    }

    return res.json({
      success: true,
      message: "Chat history retrieved successfully.",
      data: chats,
    });
  } catch (err) {
    next(err);
  }
};
