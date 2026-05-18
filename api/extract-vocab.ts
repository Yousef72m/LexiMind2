import { GoogleGenAI, Type } from "@google/genai";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export const maxDuration = 60;

export default async function handler(req: any, res: any) {
  // CORS configuration if needed
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY2,
    });

    const { text, image, mimeType } = req.body;
    if (!text && !image) {
      return res.status(400).json({ error: "No text or image provided" });
    }

    let contents: any = [];
    if (image && mimeType) {
      contents = [
        { inlineData: { data: image, mimeType: mimeType } },
        "Extract EVERYTHING that looks like an English vocabulary word from the provided image. Do NOT leave any words out. Provide all words."
      ];
    } else {
      contents = `Extract EVERYTHING that looks like an English vocabulary word from the following text. Do NOT leave any words out. Provide all words.
      Text: ${text.substring(0, 40000)} // Limiting to prevent massive payload issues
      `;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents,
      config: {
        systemInstruction: "You are an expert linguistics AI designed to extract ALL English vocabulary words from provided study material. Even basic words should be extracted if present. Output all possible words.",
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
    return res.status(200).json({ words: extractedWords });
  } catch (error) {
    console.error("Gemini API error:", error);
    return res.status(500).json({ error: "Failed to extract vocabulary" });
  }
}
