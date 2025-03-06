require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const exceptionFilter = require("./middlewares/error.middleware");

const chatRouter = require("./routes/chat.routes");
const authRouter = require("./routes/auth.routes");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use("/auth",  authRouter);
app.use("/chat", chatRouter);
app.use(exceptionFilter);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

module.exports = app;
