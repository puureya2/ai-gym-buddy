// import { GoogleGenerativeAI } from "@google/generative-ai";

// const apiKey = process.env.GEMINI_API_KEY;

// if (!apiKey) {
//   throw new Error("GEMINI_API_KEY is not defined in environment variables.");
// }

// const genAI = new GoogleGenerativeAI(apiKey);

// // Using the exact model name requested: gemini-2.5-flash
// export const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// /**
//  * Helper to generate content from the AI buddy
//  */
// export async function generateFitnessAdvice(prompt: string) {
//   try {
//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     return response.text();
//   } catch (error) {
//     console.error("Error generating content with Gemini:", error);
//     throw error;
//   }
// }

"use server";

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not defined.");
}

const genAI = new GoogleGenerativeAI(apiKey);

// Using the exact model requested: gemini-2.5-flash
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash",
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
  ],
});

/**
 * Server Action to generate fitness advice with exponential backoff retries
 */
export async function getAiAdvice(prompt: string, retries = 3, delay = 2000) {
  try {
    if (!prompt) throw new Error("Prompt is required");
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    if (!text) {
      throw new Error("AI returned an empty response.");
    }
    
    return text;
  } catch (error: any) {
    console.error(`GEMINI ATTEMPT FAILED (Retries left: ${retries}):`, error.message);
    
    // If it's a quota issue and we have retries left, wait and try again
    if (error.message?.toLowerCase().includes("quota") && retries > 0) {
      console.log(`Quota hit. Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return getAiAdvice(prompt, retries - 1, delay * 2); // Exponential backoff
    }

    // Specific error mapping
    if (error.message?.includes("API key not valid")) {
      throw new Error("INTERNAL: AI API Key configuration error.");
    }
    
    throw new Error(error.message || "TACTICAL LINK ERROR: Failed to generate advice.");
  }
}
