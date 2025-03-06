const request = require("supertest");
const app = require("../server");
const prisma = require("../config/db");
const { getAIResponse } = require("../services/chat.service");

jest.mock("../config/db", () => ({
  chat: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  message: {
    createMany: jest.fn(),
  },
}));

jest.mock("../services/chat.service", () => ({
  getAIResponse: jest.fn(),
}));

describe("Chat Controller", () => {
  let token, userId, existingChatId;

  beforeAll(() => {
    userId = "7e28932a-8d5f-4a1c-91fa-b07f2ef3aec0";
    token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3ZTI4OTMyYS04ZDVmLTRhMWMtOTFmYS1iMDdmMmVmM2FlYzAiLCJpYXQiOjE3NDEyNTE5MDMsImV4cCI6MTc0MTI1NTUwM30.XIpEJCGv0ut4WEoN4ZjDTpLq7gosskwMsgM8PimfF7w";

    existingChatId = "4a78c7b0-7c9c-46ae-aaa1-8bc41d987bb1";

    prisma.chat.create.mockResolvedValue({
      id: existingChatId,
      userId,
      agentType: "generic",
    });

    getAIResponse.mockResolvedValue(
      "I cannot provide information about the game of cricket. My expertise is limited to legal matters and I am unable to answer questions outside of that scope.\n"
    );
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe("POST /chat/ai", () => {
    it("should create a new chat and return AI response", async () => {
      prisma.chat.findUnique.mockResolvedValue({
        id: existingChatId,
        userId,
        messages: [],
      });
      prisma.message.createMany.mockResolvedValue({ count: 2 });

      const res = await request(app)
        .post("/chat/ai")
        .set("Authorization", `Bearer ${token}`)
        .send({ agentType: "generic", prompt: "Hello AI" });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("AI response received successfully.");
      expect(res.body.data).toHaveProperty("chatId", existingChatId);
      expect(res.body.data).toHaveProperty(
        "response",
        "I cannot provide information about the game of cricket. My expertise is limited to legal matters and I am unable to answer questions outside of that scope.\n"
      );
      expect(getAIResponse).toHaveBeenCalledWith("Hello AI", "generic");
    });

    it("should use an existing chat when bodyChatId is provided", async () => {
      prisma.chat.findUnique.mockResolvedValue({
        id: existingChatId,
        userId,
        messages: [],
      });

      const res = await request(app)
        .post("/chat/ai")
        .set("Authorization", `Bearer ${token}`)
        .send({
          bodyChatId: existingChatId,
          agentType: "generic",
          prompt: "Continue chat",
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.chatId).toBe(existingChatId);
    });

    it("should return 400 if prompt is missing", async () => {
      const res = await request(app)
        .post("/chat/ai")
        .set("Authorization", `Bearer ${token}`)
        .send({ agentType: "generic" });

      expect(res.statusCode).toBe(400);
    });

    it("should return 400 if agentType is missing", async () => {
      const res = await request(app)
        .post("/chat/ai")
        .set("Authorization", `Bearer ${token}`)
        .send({ prompt: "Hello AI" });

      expect(res.statusCode).toBe(400);
    });
  });

  describe("GET /chat/history", () => {
    it("should return chat history", async () => {
      prisma.chat.findMany.mockResolvedValue([
        { id: existingChatId, userId, messages: [{ content: "Hello AI" }] },
      ]);

      const res = await request(app)
        .get("/chat/history")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it("should return 404 if no chats are found", async () => {
      prisma.chat.findMany.mockResolvedValue([]);

      const res = await request(app)
        .get("/chat/history")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
    });
  });
});
