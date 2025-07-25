const express = require('express');
const path = require('path');

const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allows your front-end to call this server
app.use(express.json()); // Allows server to read JSON from requests

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Initialize the Gemini AI Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

// Define the API endpoint
app.post("/get-explanation", async (req, res) => {
  try {
    const { prompt } = req.body;
    console.log("Received prompt:", prompt);
    

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("AI Response:", text);
    

    res.json({ explanation: text });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ error: "Failed to get explanation from AI." });
  }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});