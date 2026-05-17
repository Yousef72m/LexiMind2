import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import fetch from "node-fetch";

// Polyfill fetch for node environment if needed, but modern Node has it built-in.
// The GenAI SDK uses it.

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // Initialize Gemini AI
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY2,
    httpOptions: { headers: { "User-Agent": "aistudio-build" } },
  });

  // Example backend model call to extract vocabulary from text
  app.post("/api/extract-vocab", async (req, res) => {
    try {
      const { text, image, mimeType } = req.body;
      if (!text && !image) {
        return res.status(400).json({ error: "No text or image provided" });
      }

      let contents: any = [];
      if (image && mimeType) {
        contents = [
          { inlineData: { data: image, mimeType: mimeType } },
          "Extract up to 20 important, challenging English vocabulary words from the provided image. Do not extract basic words."
        ];
      } else {
        contents = `Extract up to 20 important, challenging English vocabulary words from the following text. Do not extract basic words.
        Text: ${text.substring(0, 10000)} // Limiting to prevent massive payload issues
        `;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents,
        config: {
          systemInstruction: "You are an expert linguistics AI designed to extract difficult and important English vocabulary words from provided study material.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                word: { type: Type.STRING, description: "The English word" },
                meaning: { type: Type.STRING, description: "Arabic meaning" },
                explanation: { type: Type.STRING, description: "Simple English explanation" },
                explanationAr: { type: Type.STRING, description: "Simple Arabic explanation of the English word" },
                example: { type: Type.STRING, description: "An example sentence using the word in English" },
                exampleAr: { type: Type.STRING, description: "The Arabic translation of the example sentence" },
                difficulty: { type: Type.STRING, description: "Difficulty level: 'Easy', 'Medium', or 'Hard'" }
              },
              required: ["word", "meaning", "explanation", "explanationAr", "example", "exampleAr", "difficulty"]
            }
          }
        }
      });

      const extractedWords = JSON.parse(response.text || "[]");
      res.json({ words: extractedWords });
    } catch (error) {
      console.error("Gemini API error:", error);
      res.status(500).json({ error: "Failed to extract vocabulary" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
