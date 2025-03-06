const axios = require("axios");

const geminiApiKey = process.env.GEMINI_API_KEY;

const getAIResponse = async (prompt, agentType) => {
  try {
    const agentInstructions = {
      legal:
        "You are a legal expert. Only provide answers related to laws, legal advice, and court-related matters. Do not respond to unrelated topics.",
      generic:
        "You are a general assistant. Answer questions on various topics in a neutral and informative way.",
      research:
        "You are a research assistant. Provide in-depth and well-cited answers based on research and factual data.",
      prd: "You are a product development expert. Provide insights, best practices, and innovative ideas related to product development and management.",
    };

    if (!agentInstructions[agentType]) {
      throw new Error("Invalid agent type");
    }

    const modifiedPrompt = `${agentInstructions[agentType]}\n\nUser Query: ${prompt}`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: modifiedPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.9,
          maxOutputTokens: 4000,
          responseMimeType: "text/plain",
        },
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    if (
      !response ||
      !response.data ||
      !response.data.candidates ||
      !response.data.candidates[0]
    ) {
      throw new Error("Failed to generate AI response");
    }

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error(`Error fetching AI response: ${error.message}`);
    return "Error processing request";
  }
};

module.exports = { getAIResponse };
