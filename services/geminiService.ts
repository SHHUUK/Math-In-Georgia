
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChatMessage, ChatRole, QuizQuestion, ExamQuestion } from '../types';

// --- Configuration ---
const getAiClient = () => {
  if (!process.env.API_KEY) {
    console.error("API Key is missing.");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// --- Chat Service ---
export const chatWithGemini = async (
  history: ChatMessage[], 
  newMessage: string,
  base64Image?: string,
  mimeType: string = 'image/png'
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Error: API Key not configured.";

  try {
    const promptText = `
      System: You are an expert mathematics tutor for Georgian students. 
      
      **EXPLANATION STYLE:**
      - Explain the logic fundamentally and simply.
      - **Tone:** Mature, professional, encouraging, and clear.
      - Focus on the "Why" and "How".
      
      **CRITICAL FORMATTING RULES (NO LATEX):**
      1. **ABSOLUTELY NO LATEX:** Do NOT use dollar signs ($) or LaTeX commands like \\frac, \\sqrt, \\cdot, \\mathbb.
      2. **USE STANDARD VISUAL SYMBOLS:**
         - **Fractions:** Write as "1/2", "2/7", "a/b". NEVER use \\frac{...}{...}.
         - **Roots:** Use "√x", "∛x". NEVER use \\sqrt{...}.
         - **Powers:** Use "x²", "x³", "x^n".
         - **Multiplication:** Use "×" or "·".
         - **Sets:** Use "N", "Z", "R" (or Unicode ℕ, ℤ, ℝ if available without LaTeX formatting).
         - **Approximation:** "≈".
      3. **Structure:** Use • Bullet points (black dots) for lists. Do NOT use Markdown headers (###).
      
      **REQUIRED OUTPUT STRUCTURE:**
      1. **Explanation:** The answer to the user's question (in Georgian).
      2. **Similar Practice Problem:** At the very end, generate a similar math problem labeled "**მსგავსი სავარჯიშო:**".
      
      Conversation History:
      ${history.map(h => `${h.role === ChatRole.USER ? 'User' : 'Model'}: ${h.text}`).join('\n')}
      
      User: ${newMessage}
    `;

    // Prepare contents array
    const contents = [];
    
    // If image is provided, add it as the first part
    if (base64Image) {
      contents.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Image
        }
      });
    }
    
    // Add text prompt
    contents.push({ text: promptText });

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts: contents },
    });

    return response.text || "სამწუხაროდ, პასუხის გაცემა ვერ მოხერხდა.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "დაფიქსირდა შეცდომა კავშირის დროს. გთხოვთ სცადოთ მოგვიანებით.";
  }
};

// --- Vision Service ---
export const analyzeImageWithGemini = async (
  base64Image: string,
  mimeType: string
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Error: API Key not configured.";

  try {
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
              თქვენ ხართ გამოცდილი მათემატიკის მასწავლებელი.
              გააანალიზეთ ფოტო და აუხსენით ამოცანა.

              **სტილი და ფორმატი (მკაცრად):**
              1. **აკრძალულია LaTeX ($):** არ გამოიყენოთ $\\frac{...}{...}$. გამოიყენეთ უბრალო ტექსტი: "1/2", "x²", "√x".
              2. **სტრუქტურა:**
                 • **რა არის სურათზე?** (მოკლე აღწერა)
                 • **საჭირო ფორმულა**
                 • **ნაბიჯ-ნაბიჯ ამოხსნა**
                 • **ანალოგია** (მარტივი ცხოვრებისეული მაგალითი)
                 • **საბოლოო პასუხი**
              3. ენა: ქართული.
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

// --- Practice Problem Service ---
export const generateSimilarProblem = async (
  originalContext: string
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Error: API Key missing.";

  try {
    const prompt = `
      Based on the previous math analysis provided below, generate a **similar practice problem** for the student to solve.
      
      Original Context:
      ${originalContext.substring(0, 1000)}...
      
      Output Format (in Georgian):
      1. **New Problem**: State a similar problem with different numbers but the same logic.
      2. **Hint**: A small hint on which formula to use.
      3. **Answer (Hidden)**: Provide the correct answer at the very end, labeled "**სწორი პასუხი:**".
      
      Formatting: **NO LaTeX ($)**. Use "1/2", "x²", "√". No markdown headers.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });

    return response.text || "ვერ მოხერხდა მსგავსი მაგალითის შექმნა.";
  } catch (error) {
    console.error("Gen Similar Problem Error:", error);
    return "შეცდომა ახალი მაგალითის გენერირებისას.";
  }
};

// --- Illustration Service ---
export const generateMathIllustration = async (
  topicTitle: string, 
  topicExplanation: string
): Promise<string | null> => {
  const ai = getAiClient();
  if (!ai) return null;

  try {
    // Refined prompt for abstract, flat math illustrations
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{
          text: `Generate a high-quality, abstract, flat-design educational illustration for the math concept: "${topicTitle}". 
                 Description: ${topicExplanation}. 
                 Style: Modern minimalist, geometric shapes, isometric view, using a palette of Indigo, Violet, and White. 
                 Constraint: No text, no numbers, no letters inside the image. Clean background.`
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

// --- Quiz Service ---
export const generateQuiz = async (topic: string): Promise<QuizQuestion[]> => {
  const ai = getAiClient();
  if (!ai) return [];

  try {
    const prompt = `
      Generate 5 multiple-choice mathematics questions about "${topic}" in Georgian language.
      
      Strictly Output JSON format ONLY. Do not add markdown code blocks.
      
      Rules:
      - **NO LaTeX ($)**. Use plain text: "1/2", "x²", "√".
      - No markdown headers.
      - Explanations should be clear.
      
      Structure:
      [
        {
          "id": "q1",
          "question": "Question text",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswerIndex": 0,
          "explanation": "Brief explanation",
          "hint": "Small hint" 
        }
      ]
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

    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonString) as QuizQuestion[];
  } catch (error) {
    console.error("Quiz Generation Error:", error);
    return [];
  }
};

// --- National Exam Service ---

export const generateMockExam = async (): Promise<ExamQuestion[]> => {
  const ai = getAiClient();
  if (!ai) return [];

  try {
    const prompt = `
      Generate a Mock Georgian National Mathematics Exam (NAEC style).
      Language: Georgian.
      Format: JSON ONLY.
      
      The exam MUST contain exactly 40 QUESTIONS total.
      
      Structure:
      - Questions 1-35: Multiple Choice (1 Point each). 4 Options.
      - Questions 36-40: Open-Ended (3 or 4 Points each). No options.
      
      Rules:
      - **NO LaTeX ($)**. Use Unicode: "x²", "√", "1/2".
      - Covers Algebra, Geometry, Statistics, Trigonometry.
      - Keep text concise.
      
      JSON Schema:
      [
        {
          "id": 1,
          "type": "mc",
          "points": 1,
          "text": "Question text",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": "Index (0-3) as STRING"
        },
        ...
        {
          "id": 36,
          "type": "open",
          "points": 3,
          "text": "Problem text",
          "rubric": "Grading criteria"
        }
      ]
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
    
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonString) as ExamQuestion[];

  } catch (error) {
    console.error("Exam Gen Error:", error);
    return [];
  }
};

export const gradeOpenEndedQuestion = async (
  questionText: string,
  rubric: string,
  userAnswer: string,
  maxPoints: number
): Promise<{score: number, feedback: string}> => {
  const ai = getAiClient();
  if (!ai) return { score: 0, feedback: "Error: API Key missing" };

  try {
    const prompt = `
      You are a strict math exam grader.
      
      Question: "${questionText}"
      Rubric: "${rubric}"
      Student Answer: "${userAnswer}"
      Max Points: ${maxPoints}
      
      Evaluate the answer.
      - Feedback MUST be in Georgian.
      - **NO LaTeX in feedback**.
      
      Output JSON ONLY:
      {
        "score": number,
        "feedback": "Short feedback in Georgian"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    
    const text = response.text;
    if (!text) return { score: 0, feedback: "Error: No response" };
    const result = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
    
    if (typeof result.score !== 'number') result.score = 0;
    if (result.score > maxPoints) result.score = maxPoints;
    
    return result;
  } catch (error) {
    console.error("Grading Error:", error);
    return { score: 0, feedback: "შეფასების შეცდომა (სისტემური)" };
  }
};
