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

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not defined in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * Server Action to generate fitness advice
 */
export async function getAiAdvice(prompt: string) {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating content with Gemini (Server):", error);
    throw new Error("Failed to generate AI advice");
  }
}
