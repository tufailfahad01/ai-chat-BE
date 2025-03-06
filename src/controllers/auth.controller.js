const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/db");
const ApiError = require("../utils/apiError");
const { HttpStatusCode } = require("axios");
const { registerValidation, loginValidation } = require("../validations/auth.validation");
const { ERROR_MESSAGES } = require("../utils/constants");

exports.register = async (req, res, next) => {
  try {
    const { error } = registerValidation.validate(req.body);
    if (error) throw new ApiError(HttpStatusCode.BadRequest, error.details[0].message);

    const { name, email, password } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new ApiError(HttpStatusCode.BadRequest, ERROR_MESSAGES.EMAIL_EXISTS);

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, password: hashedPassword } });

    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      data: { userId: user.id },
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { error } = loginValidation.validate(req.body);
    if (error) throw new ApiError(HttpStatusCode.BadRequest, error.details[0].message);

    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new ApiError(HttpStatusCode.Unauthorized, ERROR_MESSAGES.INVALID_EMAIL);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new ApiError(HttpStatusCode.Unauthorized, ERROR_MESSAGES.INVALID_PASSWORD);

    const token = jwt.sign({ userId: user.id, name: user.name }, process.env.JWT_SECRET, { expiresIn: "1h" });

    return res.json({
      success: true,
      message: "Login successful.",
      data: { token },
    });
  } catch (err) {
    next(err);
  }
};
