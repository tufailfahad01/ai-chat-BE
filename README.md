# ai-chat-BE

AI-Chat-BE is a backend application built with Node.js and Express. This project provides authentication services and AI chat functionalities.

# Project Structure

The project consists of the following core modules:

1. Auth Module: Handles authentication and user management.
2. ChatAI Module: Manages AI-driven chat functionalities.

# Installation

1. Clone the repository:
   git clone <repository-url>

2. Navigate to the project directory:
   cd ai-chat-be

3. Install dependencies:
   npm install

# Running the Project

To start the server, navigate to the src directory and run:

1. node server.js

# Running Tests

To execute test cases, run:

1. PORT=4000 jest

Environment Variables

Ensure you have the required environment variables configured before running the project.

# Example .env
DATABASE_URL =
JWT_SECRET =
JWT_EXPIRY_TIME = 1000000h
GEMINI_API_KEY=AIzaSyCylZhHi7v7w9RVTkYBfMbMMbW8GTsgPpE
PORT = 3001

