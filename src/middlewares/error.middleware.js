const ApiError = require("../utils/apiError");

const exceptionFilter = (err, req, res, next) => {
  console.error("Error:", err.message);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      data: null,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    data: null,
  });
};

module.exports = exceptionFilter;
