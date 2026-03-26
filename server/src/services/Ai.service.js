import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai";
import {
  HumanMessage,
  SystemMessage,
  AIMessage,
} from "@langchain/core/messages";

// models
const geminiModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GOOGLE_API_KEY,
});

const mistralModel = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY,
});

// ✅ Generate chat title
export const generateChatTitle = async (message) => {
  console.log(message);
  try {
    const response = await mistralModel.invoke([
      new SystemMessage(`
You are an expert AI assistant that creates high-quality chat titles.

Your task is to generate a short, clear, and meaningful title based on the user's message.

Rules:
- Title must be 2 to 4 words only
- Capture the main intent of the message
- Use simple and natural language
- Make it specific and relevant (not generic)
- Do NOT include punctuation like quotes or symbols
- Do NOT add extra words or explanations
- Do NOT repeat the full sentence

Focus on keywords and intent.

Examples:
User: "How to learn React Native from scratch"
Title: "Learn React Native"

User: "Fix login error in my React app"
Title: "React Login Fix"

User: "Best way to lose belly fat fast"
Title: "Lose Belly Fat"

Now generate the title.
`),
      new HumanMessage(`
            Generate a title for a chat conversation based on the following first message:
            "${message}"
            `),
    ]);

    return response.content;
  } catch (error) {
    console.log(error);
    return message.split(" ").slice(0, 5).join(" ");
  }
};

// 🔍 Detect intent: "web_search" | "send_email" | "chat"
export const detectIntent = async (message) => {
  try {
    const response = await mistralModel.invoke([
      new SystemMessage(`
You are an intent classifier for an AI chat assistant. Classify the user's message into exactly ONE of these three intents:

1. "web_search" - The user wants current/live information like news, weather, recent events, prices, scores, or anything that needs up-to-date internet data.
2. "send_email" - The user explicitly wants to send, write, or compose an email to someone.
3. "chat" - Everything else: general questions, coding help, explanations, opinions, conversation, etc.

Rules:
- Respond with ONLY ONE of these exact strings: web_search, send_email, chat
- No punctuation, no explanation, no extra words.
- When in doubt, use "chat".

Examples:
"What's today's news in tech?" -> web_search
"latest bitcoin price" -> web_search
"who won the IPL match today" -> web_search
"send an email to ali@gmail.com about the meeting tomorrow" -> send_email
"write an email to john@example.com subject: Hello" -> send_email
"how do I reverse a string in Python?" -> chat
"tell me a joke" -> chat
`),
      new HumanMessage(message),
    ]);

    const intent = response.content.trim().toLowerCase();
    if (["web_search", "send_email", "chat"].includes(intent)) return intent;
    return "chat";
  } catch (error) {
    console.log("Intent detection failed:", error);
    return "chat";
  }
};

// 📧 Extract email details from message using AI
export const extractEmailDetails = async (message) => {
  try {
    const response = await mistralModel.invoke([
      new SystemMessage(`
You extract email details from a user's message. Return ONLY a valid JSON object with these fields:
{
  "to": "<recipient email address>",
  "subject": "<email subject>",
  "body": "<email body text>"
}

Rules:
- "to" must be a valid email address found in the message
- "subject" should be a short summary if not explicitly stated
- "body" should be the main content of the email
- Return ONLY the raw JSON object, no markdown, no explanation
`),
      new HumanMessage(message),
    ]);

    const parsed = JSON.parse(response.content.trim());
    return parsed;
  } catch (error) {
    console.log("Email extraction failed:", error);
    return null;
  }
};

//  Generate AI response (non-streaming, kept for compatibility)
export async function generateResponse(messages) {
  console.log(messages);
  try {
    const response = await geminiModel.invoke(
      messages.map((msg) => {
        if (msg.role.toLowerCase() == "user") {
          return new HumanMessage(msg.content);
        } else if (msg.role.toLowerCase() == "ai") {
          return new AIMessage(msg.content);
        }
      }).filter(Boolean),
    );

    return response.text;
  } catch (error) {
    console.log(error);
    return "Error generating response";
  }
}

// 🔴 Generate AI response as a stream (for Socket.IO real-time streaming)
export async function generateResponseStream(messages, extraContext = "") {
    const defaultPrompt = `You are a helpful AI assistant.

Respond in a natural, conversational tone as if you are typing in real-time.

Break your response into small, easy-to-read sentences.
Avoid long paragraphs.

Structure your answer so that it can be displayed gradually (streamed) without overwhelming the user.

Use short lines, natural pauses, and logical flow.

Do not rush to complete the entire answer at once—write as if you are thinking and explaining step by step.

Keep the response engaging, human-like, and smooth.`;

    const systemPrompt = extraContext
        ? `${defaultPrompt}\n\nUse the following context to answer accurately:\n\n${extraContext}\n\nAlways cite sources if web search results are provided.`
        : defaultPrompt;

  const langchainMessages = [
    new SystemMessage(systemPrompt),
    ...messages.map((msg) => {
      if (msg.role.toLowerCase() === "user") {
        return new HumanMessage(msg.content);
      } else if (msg.role.toLowerCase() === "ai") {
        return new AIMessage(msg.content);
      }
    }).filter(Boolean),
  ];

  // Returns an async iterable of chunks
  return geminiModel.stream(langchainMessages);
}
