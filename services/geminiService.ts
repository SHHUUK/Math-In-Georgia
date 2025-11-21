
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChatMessage, ChatRole, QuizQuestion } from '../types';

export const chatWithGemini = async (
  history: ChatMessage[], 
  newMessage: string
): Promise<string> => {
  if (!process.env.API_KEY) {
    console.error("API Key is missing. Please check your environment variables.");
    return "Error: API Key not configured.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      System: You are an expert mathematics tutor for Georgian students. 
      Your goal is to explain concepts simply using the Feynman technique.
      
      IMPORTANT FORMATTING RULES:
      1. Always answer in the Georgian language.
      2. DO NOT use LaTeX formatting (like $x^2$, \\frac{a}{b}, or ** notation for powers).
      3. INSTEAD, use visual Unicode mathematical symbols to make it look like natural writing:
         - Use superscripts for powers: x², y³, aⁿ, 10⁻¹
         - Use symbols for operations: √, ∛, π, °, ×, ÷, ≈, ≠, ≤, ≥, ∞, ∫, ∑, ∆
         - For fractions, use the slash format with spacing if simple (a/b) or describe it clearly.
      4. Structure the response with clear paragraphs, emojis for sections, and numbered steps.
      5. Keep the tone encouraging and sophisticated but easy to read.
      
      Conversation History:
      ${history.map(h => `${h.role === ChatRole.USER ? 'User' : 'Model'}: ${h.text}`).join('\n')}
      
      User: ${newMessage}
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });

    return response.text || "სამწუხაროდ, პასუხის გაცემა ვერ მოხერხდა.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "დაფიქსირდა შეცდომა კავშირის დროს. გთხოვთ სცადოთ მოგვიანებით.";
  }
};

export const analyzeImageWithGemini = async (
  base64Image: string,
  mimeType: string
): Promise<string> => {
  if (!process.env.API_KEY) {
    console.error("API Key is missing. Please check your environment variables.");
    return "Error: API Key not configured.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image
            }
          },
          {
            text: `
              გთხოვთ, დეტალურად გააანალიზოთ ეს მათემატიკური ამოცანა ან სურათი.
              
              ინსტრუქცია ფორმატირებისთვის:
              1. პასუხი გაეცით ქართულად, გამართული და ლამაზი ენით.
              2. ნუ გამოიყენებთ LaTeX კოდებს (მაგალითად: $...$, \\frac, ^ ნიშნებს).
              3. გამოიყენეთ ჩვეულებრივი მათემატიკური სიმბოლოები, როგორც წიგნშია (მაგალითად: x², √25, 90°, π).
              4. ამოხსნა დაყავით ნაბიჯებად და თითოეული ნაბიჯი ახსენით გასაგებად.
              5. საბოლოო პასუხი გამოყავით მკაფიოდ.
            `
          }
        ]
      }
    });

    return response.text || "სურათის გაანალიზება ვერ მოხერხდა.";
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return "შეცდომა სურათის დამუშავებისას.";
  }
};

export const generateMathIllustration = async (
  topicTitle: string, 
  topicExplanation: string
): Promise<string | null> => {
  if (!process.env.API_KEY) {
    console.error("API Key is missing.");
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{
          text: `Create a flat-style, minimalist, educational vector illustration representing the mathematical concept of "${topicTitle}". Context: ${topicExplanation}. Use vibrant, clean colors suitable for a modern study app. Do not include text in the image.`
        }]
      }
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
           return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Image Generation Error:", error);
    return null;
  }
};

export const generateQuiz = async (topic: string): Promise<QuizQuestion[]> => {
  if (!process.env.API_KEY) {
    console.error("API Key is missing.");
    return [];
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      Generate 5 multiple-choice mathematics questions about "${topic}" in Georgian language.
      
      Strictly Output JSON format ONLY. Do not add markdown code blocks.
      Structure:
      [
        {
          "id": "q1",
          "question": "Question text in Georgian",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswerIndex": 0, // 0-3
          "explanation": "Brief explanation in Georgian why this is correct"
        }
      ]
      
      Use Unicode math symbols (x², √, π) instead of LaTeX code.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) return [];

    // Clean potential markdown formatting just in case
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonString) as QuizQuestion[];
  } catch (error) {
    console.error("Quiz Generation Error:", error);
    return [];
  }
};
