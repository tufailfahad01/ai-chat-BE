const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/history", authMiddleware, chatController.getChatHistory);
router.post("/ai", authMiddleware, chatController.chatWithAI);

module.exports = router;
