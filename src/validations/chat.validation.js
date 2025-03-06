const Joi = require("joi");
const { VALID_AGENT_TYPES } = require("../utils/constants");



exports.chatWithAIValidation = Joi.object({
    agentType: Joi.string()
    .valid(...VALID_AGENT_TYPES)
    .required(),
  prompt: Joi.string().trim().required(),
  bodyChatId: Joi.string().optional(),
});
