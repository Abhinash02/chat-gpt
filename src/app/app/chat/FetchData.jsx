import { GoogleGenerativeAI } from "@google/generative-ai";
async function FetchData({ chatHistory }) {
  const API_KEY = process.env.NEXT_PUBLIC_GEMINIAI_API_KEY;
  if (!API_KEY) {
    console.error("API Key is missing!");
    return "Error: API Key is missing.";
  }
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const formattedHistory = chatHistory.map(chat => `${chat.role}: ${chat.text}`).join("\n"); // ✅ Send full history
    const result = await model.generateContent(formattedHistory);
    const textResponse = await result.response.text();
    return textResponse;
  } catch (error) {
    console.error("Error fetching data:", error);
    return "Error fetching AI response.";
  }
}
export default FetchData;
